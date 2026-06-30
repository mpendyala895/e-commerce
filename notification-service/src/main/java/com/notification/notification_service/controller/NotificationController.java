package com.notification.notification_service.controller;

import com.notification.notification_service.config.NotificationStore;
import com.notification.notification_service.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationStore notificationStore;

    @GetMapping("/all")
    public List<OrderPlacedEvent> getAllNotifications() {
        return notificationStore.getAll();
    }
}
