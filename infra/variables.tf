variable "cluster_name" {
  description = "Name of the Kind cluster"
  type        = string
  default     = "fiap-mecanica-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the Kind cluster"
  type        = string
  default     = "v1.29.2"
}

variable "image_name" {
  description = "Docker image name for the application"
  type        = string
  default     = "fiap-mecanica:latest"
}

variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "fiap-mecanica"
}

variable "db_user" {
  description = "PostgreSQL database user"
  type        = string
  default     = "workshop"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  default     = "workshop123"
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "workshop_db"
}
