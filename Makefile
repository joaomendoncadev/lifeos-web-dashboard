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
