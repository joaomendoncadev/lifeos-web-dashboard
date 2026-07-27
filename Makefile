.PHONY: up down logs reset web api
up:
	podman compose up --build
down:
	podman compose down
logs:
	podman compose logs -f
reset:
	podman compose down -v
web:
	cd apps/web && npm install && npm run dev
api:
	cd apps/api && mvn spring-boot:run

.PHONY: test smoke backup

test:
	cd apps/api && mvn test
	cd apps/web && npm run typecheck && npm run build

smoke:
	./scripts/smoke-test.sh

backup:
	./scripts/backup.sh
