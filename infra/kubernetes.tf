provider "kubernetes" {
  host                   = kind_cluster.default.endpoint
  cluster_ca_certificate = kind_cluster.default.cluster_ca_certificate
  client_certificate     = kind_cluster.default.client_certificate
  client_key             = kind_cluster.default.client_key
}

resource "kubernetes_namespace" "fiap_mecanica" {
  metadata {
    name = var.namespace
    labels = {
      app = "fiap-mecanica"
    }
  }

  depends_on = [kind_cluster.default]
}

resource "null_resource" "load_docker_image" {
  provisioner "local-exec" {
    command = "kind load docker-image ${var.image_name} --name ${var.cluster_name}"
  }

  depends_on = [kind_cluster.default]
}

resource "null_resource" "apply_k8s_manifests" {
  provisioner "local-exec" {
    command = "kubectl apply -f ../k8s/ --kubeconfig ${kind_cluster.default.kubeconfig_path}"
  }

  depends_on = [
    kubernetes_namespace.fiap_mecanica,
    null_resource.load_docker_image,
  ]
}
