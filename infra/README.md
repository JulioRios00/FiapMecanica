# Terraform Infrastructure - FiapMecanica

This directory contains Terraform configurations to provision a local Kubernetes cluster using Kind (Kubernetes in Docker) and deploy the FiapMecanica application.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0.0
- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- Docker image `fiap-mecanica:latest` built locally

## Build the Docker Image

Before provisioning, build the application image:

```bash
cd ..
docker build -t fiap-mecanica:latest .
```

## Usage

### Initialize Terraform

```bash
terraform init
```

### Preview Changes

```bash
terraform plan
```

### Apply Infrastructure

```bash
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

## Resources Created

| Resource | Description |
|----------|-------------|
| `kind_cluster` | Local Kubernetes cluster with control-plane and worker node |
| `kubernetes_namespace` | `fiap-mecanica` namespace |
| `null_resource.load_docker_image` | Loads Docker image into Kind cluster |
| `null_resource.apply_k8s_manifests` | Applies all Kubernetes manifests from `../k8s/` |

## Outputs

| Output | Description |
|--------|-------------|
| `cluster_name` | Name of the Kind cluster |
| `kubeconfig_path` | Path to the kubeconfig file |
| `app_url` | URL to access the application |
| `kubectl_get_pods` | Command to get pods |
| `kubectl_get_services` | Command to get services |

## Accessing the Application

After `terraform apply`, the application is available at:

- **API**: http://localhost:30000/api/v1
- **Swagger**: http://localhost:30000/api/docs
- **Health Check**: http://localhost:30000/api/v1/health

## Verify Deployment

```bash
# Check pods
kubectl get pods -n fiap-mecanica

# Check services
kubectl get svc -n fiap-mecanica

# Check HPA
kubectl get hpa -n fiap-mecanica

# View logs
kubectl logs -n fiap-mecanica -l app=fiap-mecanica-app --tail=50
```
