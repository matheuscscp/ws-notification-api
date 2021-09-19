deps:
	docker-compose -f docker-compose.yml -p ws_notification_api up -d

deps-down:
	docker-compose -f docker-compose.yml -p ws_notification_api down
