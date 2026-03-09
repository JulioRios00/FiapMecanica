output "endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}

output "database_url" {
  value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/fiapmecanica"
  sensitive = true
}
