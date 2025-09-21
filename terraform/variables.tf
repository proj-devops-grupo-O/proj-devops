variable "project_name" {
  description = "Project identifier for tagging"
  type        = string
  default     = "subscription-manager"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (free tier eligible: t2.micro/t3.micro)"
  type        = string
  default     = "t3.micro"
}

variable "ssh_ingress_cidrs" {
  description = "CIDR blocks allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "app_port" {
  description = "Application public port"
  type        = number
  default     = 3000
}

variable "key_pair_name" {
  description = "AWS EC2 key pair name to create/use"
  type        = string
  default     = "subscription-manager-key"
}

variable "ssh_public_key" {
  description = "Public SSH key material for the EC2 key pair (e.g., ssh-ed25519 ... or ssh-rsa ...)"
  type        = string
}