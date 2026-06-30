package com.notification.notification_service.config;

import com.notification.notification_service.event.OrderPlacedEvent;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class NotificationStore {
    private final List<OrderPlacedEvent> notifications = new CopyOnWriteArrayList<>();

    public void add(OrderPlacedEvent event) {
        // Keep the latest 50 notifications in memory to avoid memory bloat
        if (notifications.size() >= 50) {
            notifications.remove(0);
        }
        notifications.add(event);
    }

    public List<OrderPlacedEvent> getAll() {
        return notifications;
    }
}
