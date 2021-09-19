all:
	docker build . -t ws-notification-api:latest

deps:
	docker-compose -f docker-compose.yml -p ws_notification_api up -d

deps-down:
	docker-compose -f docker-compose.yml -p ws_notification_api down
