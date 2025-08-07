-- Sample data creation for the subscription system

-- Sample customers
INSERT INTO customers (id, name, email, phone, "createdAt", "updatedAt") 
VALUES 
  ('customer_1', 'John Silva', 'john.silva@email.com', '+55 11 99999-1111', NOW(), NOW()),
  ('customer_2', 'Maria Santos', 'maria.santos@email.com', '+55 11 99999-2222', NOW(), NOW()),
  ('customer_3', 'Peter Oliveira', 'peter.oliveira@email.com', '+55 11 99999-3333', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample plans
INSERT INTO plans (id, name, price, recurrence, description, active, "createdAt", "updatedAt")
VALUES 
  ('basic_plan', 'Basic Plan', 29.90, 'monthly', 'Basic access to resources', true, NOW(), NOW()),
  ('premium_plan', 'Premium Plan', 59.90, 'monthly', 'Full access + priority support', true, NOW(), NOW()),
  ('yearly_plan', 'Yearly Plan', 299.90, 'yearly', 'Annual plan with discount', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample active subscriptions
INSERT INTO active_subscriptions (id, "customerId", "planId", "startDate", status, "nextBilling", "createdAt", "updatedAt")
VALUES 
  ('subscription_1', 'customer_1', 'basic_plan', '2024-01-01', 'active', '2024-02-01', NOW(), NOW()),
  ('subscription_2', 'customer_2', 'premium_plan', '2024-01-15', 'active', '2024-02-15', NOW(), NOW()),
  ('subscription_3', 'customer_3', 'yearly_plan', '2024-01-01', 'active', '2025-01-01', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- First run: create a sample charge
-- (Commented to avoid conflicts - will be created via API)
/*
INSERT INTO charges (id, "subscriptionId", "chargeDate", amount, status, description, attempts, "createdAt", "updatedAt")
VALUES 
  ('sample_charge', 'subscription_1', NOW(), 29.90, 'pending', 'Basic Plan Charge', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
*/ 