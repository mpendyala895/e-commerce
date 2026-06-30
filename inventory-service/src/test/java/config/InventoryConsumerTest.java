package config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.inventory_service.config.InventoryConsumer;
import com.inventory.inventory_service.event.InventoryEvent;
import com.inventory.inventory_service.model.Inventory;
import com.inventory.inventory_service.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class InventoryConsumerTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private InventoryConsumer inventoryConsumer;

    private Inventory inventory;

    private InventoryEvent inventoryEvent;

    @BeforeEach
    void setUp() {

        inventoryEvent =
                new InventoryEvent();

        inventoryEvent.setSkuCode(
                "iphone_16"
        );

        inventoryEvent.setQuantity(10);

        inventory =
                new Inventory();

        inventory.setSkuCode(
                "iphone_17"
        );

        inventory.setQuantity(5);
    }

    @Test
    void shouldSaveInventory() throws Exception {
        String message = """
                {
                    "skuCode":"iphone_16",
                    "quantity":10
                }
                """;

        when(objectMapper.readValue(message,
                InventoryEvent.class)).thenReturn(inventoryEvent);

        when(inventoryRepository.findBySkuCode(
                inventoryEvent.getSkuCode()
        )).thenReturn(Optional.empty());

        inventoryConsumer.consume(message);

        verify(inventoryRepository,times(1))
                .findBySkuCode(inventoryEvent.getSkuCode());

        verify(inventoryRepository,times(1))
                .flush();
    }

    @Test
    void shouldUpdateExsistingInventory() throws Exception {
        String message = """
                {
                    "skuCode":"iphone_16",
                    "quantity":10
                   }
        """;

        when(objectMapper.readValue(message,InventoryEvent.class))
                .thenReturn(inventoryEvent);

        when(inventoryRepository.findBySkuCode(
                inventoryEvent.getSkuCode()
        ))
                .thenReturn(Optional.of(inventory));

        when(inventoryRepository.save(inventory))
                .thenReturn(inventory);

        inventoryConsumer.consume(message);

        verify(inventoryRepository,times(1))
                .save(inventory);

        verify(inventoryRepository,times(1))
                .flush();


    }

    @Test
    void shouldHandleInvalidJson() throws Exception {
        String message =
                "Invalid Json";

        when(objectMapper.readValue(
                message,
                InventoryEvent.class
        )).thenThrow(
                new RuntimeException(
                        "Invalid Json"
                )
        );

        inventoryConsumer.consume(message);

        verify(inventoryRepository,never())
            .save(inventory);
    }

    @Test
    void shouldHandleRepositoryFailure() throws Exception {
        String message = """
                {
                    "skuCode":"iphone_16",
                    "quantity":10
                }
                """;

        when(objectMapper.readValue(message,InventoryEvent.class))
                .thenReturn(inventoryEvent);

        when(inventoryRepository.findBySkuCode(inventoryEvent.getSkuCode()))
                .thenReturn(Optional.empty());

        when(inventoryRepository.save(any(Inventory.class)))
                .thenThrow(
                        new RuntimeException(
                                "DataBase Error"
                        )
                );

        inventoryConsumer.consume(message);

        verify(inventoryRepository,times(1))
                .save(any(Inventory.class));

    }

}
