package com.notification.notification_service;

import com.notification.notification_service.event.OrderPlacedEvent;
import com.notification.notification_service.config.NotificationStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.KafkaListener;

@SpringBootApplication
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceApplication {

	private final NotificationStore notificationStore;

	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

	@KafkaListener(topics = "notificationTopic")
	public void handleNotification(
			OrderPlacedEvent event) {

		log.info(
				"Order : {} | Status : {} | Message : {}",
				event.getOrderNumber(),
				event.getStatus(),
				event.getMessage()
		);

		try {
			notificationStore.add(event);
		} catch (Exception e) {
			log.error("Failed to add notification to store: {}", e.getMessage());
		}
	}
}
