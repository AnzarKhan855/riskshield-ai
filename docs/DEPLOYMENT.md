# 🚀 RiskShield AI — Enterprise Production Deployment Guide

## 1. Production Architecture Topology

In a production environment, RiskShield AI runs as a horizontally scalable microservice cluster behind a cloud load balancer (AWS ALB, GCP Cloud Load Balancing, or Cloudflare):

```mermaid
flowchart TD
    INTERNET(("Internet / Clients")) --> CDN["Cloudflare / WAF"]
    CDN --> ALB["Application Load Balancer"]
    
    subgraph K8S["Kubernetes Cluster (EKS / GKE)"]
        subgraph FRONTEND_TIER["Frontend Deployment"]
            FE1["Next.js Pod 1"]
            FE2["Next.js Pod 2"]
            FE3["Next.js Pod 3"]
        end
        
        subgraph BACKEND_TIER["Backend Decision Mesh"]
            BE1["FastAPI Pod 1"]
            BE2["FastAPI Pod 2"]
            BE3["FastAPI Pod 3"]
        end

        subgraph WORKER_TIER["Asynchronous Processing"]
            CW1["Celery Worker 1"]
            CW2["Celery Worker 2"]
        end
    end

    subgraph MANAGED_DATA["Cloud Managed Data Tier"]
        RDS[("AWS Aurora PostgreSQL (Multi-AZ)")]
        ELASTI[("AWS ElastiCache Redis Cluster")]
        MONGO[("MongoDB Atlas")]
    end

    ALB --> FRONTEND_TIER
    ALB --> BACKEND_TIER
    BACKEND_TIER --> ELASTI
    BACKEND_TIER --> RDS
    BACKEND_TIER --> MONGO
    WORKER_TIER --> ELASTI
    WORKER_TIER --> RDS
```

---

## 2. Docker Production Deployment

### 2.1 Launching with Production Docker Compose
The repository includes `docker-compose.prod.yml` configured with resource limits, health checks, and log rotation:

```bash
# 1. Export production secrets
export SECRET_KEY="$(openssl rand -hex 32)"
export POSTGRES_PASSWORD="secure_strong_production_password"

# 2. Build and launch containers in background
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Monitor container health
docker-compose -f docker-compose.prod.yml ps
```

---

## 3. Kubernetes Manifests (Helm / Kustomize)

### 3.1 Horizontal Pod Autoscaling (HPA)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: riskshield-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: riskshield-backend
  minReplicas: 3
  maxReplicas: 25
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 4. Zero-Downtime Rolling Update Protocol

1. **Pre-flight Check**: Run automated unit and integration tests against staging.
2. **Database Migration**: Apply non-destructive Alembic migrations (`alembic upgrade head`).
3. **Rolling Pod Deployment**: Deploy new backend container images using `maxSurge: 25%` and `maxUnavailable: 0%`.
4. **Health Check Probing**: Kubernetes waits for `/api/v1/health` to return `200 OK` before routing ingress traffic.
5. **Rollback Trigger**: If error rates exceed 0.05% within 5 minutes, deployment rolls back automatically.
