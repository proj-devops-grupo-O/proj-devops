locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# Use default VPC and default public subnet for simplicity
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default_public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = var.key_pair_name
  public_key = var.ssh_public_key
}

resource "aws_security_group" "app_sg" {
  name        = "${local.name_prefix}-sg-"
  description = "Security group for app instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Allow app port"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_ingress_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-sg"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  user_data = <<-EOT
    #!/bin/bash
    set -euo pipefail
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    mkdir -p /opt/subscription-manager
  EOT
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.deployer.key_name
  subnet_id                   = data.aws_subnets.default_public.ids[0]
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  associate_public_ip_address = true

  user_data = local.user_data

  tags = {
    Name        = "${local.name_prefix}-ec2"
    Environment = var.environment
  }
}

# Allocate a static Elastic IP (free when associated) for stable SSH/Deployments

output "instance_public_ip" {
  value       = aws_instance.app.public_ip
  description = "Public IP of the application instance"
}

output "ssh_command" {
  value       = "ssh -i <your_private_key> ubuntu@${aws_instance.app.public_ip}"
  description = "SSH command to access the instance"
}
