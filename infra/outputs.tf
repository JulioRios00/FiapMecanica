output "cluster_name" {
  description = "Name of the Kind cluster"
  value       = kind_cluster.default.name
}

output "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  value       = kind_cluster.default.kubeconfig_path
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://localhost:30000/api/v1"
}

output "kubectl_get_pods" {
  description = "Command to get pods"
  value       = "kubectl get pods -n ${var.namespace}"
}

output "kubectl_get_services" {
  description = "Command to get services"
  value       = "kubectl get svc -n ${var.namespace}"
}
