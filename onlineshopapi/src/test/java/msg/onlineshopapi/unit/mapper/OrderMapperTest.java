package msg.onlineshopapi.unit.mapper;

import msg.onlineshopapi.dto.AddressDto;
import msg.onlineshopapi.dto.OrderItemRequestDto;
import msg.onlineshopapi.dto.OrderRequestDto;
import msg.onlineshopapi.dto.mapper.AddressMapper;
import msg.onlineshopapi.dto.mapper.OrderDetailMapper;
import msg.onlineshopapi.dto.mapper.OrderMapper;
import msg.onlineshopapi.model.Order;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class OrderMapperTest {

    private final OrderMapper mapper = new OrderMapper(mock(OrderDetailMapper.class), new AddressMapper());

    @Test
    void toEntity_mapsAddressFromDto() {
        AddressDto addressDto = AddressDto.builder()
                .country("Romania")
                .city("Cluj-Napoca")
                .county("Cluj")
                .streetAddress("Str. Eroilor 10")
                .build();

        OrderRequestDto dto = OrderRequestDto.builder()
                .address(addressDto)
                .items(List.of(OrderItemRequestDto.builder()
                        .productId(UUID.randomUUID())
                        .quantity(1)
                        .build()))
                .build();

        Order order = mapper.toEntity(dto);

        assertThat(order.getAddress()).isNotNull();
        assertThat(order.getAddress().getCountry()).isEqualTo("Romania");
        assertThat(order.getAddress().getCity()).isEqualTo("Cluj-Napoca");
        assertThat(order.getAddress().getCounty()).isEqualTo("Cluj");
        assertThat(order.getAddress().getStreetAddress()).isEqualTo("Str. Eroilor 10");
    }

    @Test
    void toEntity_setsNullAddress_whenAddressIsAbsentInDto() {
        OrderRequestDto dto = OrderRequestDto.builder()
                .address(null)
                .items(List.of(OrderItemRequestDto.builder()
                        .productId(UUID.randomUUID())
                        .quantity(1)
                        .build()))
                .build();

        Order order = mapper.toEntity(dto);

        assertThat(order.getAddress()).isNull();
    }

    @Test
    void toEntity_mapsOrderItems() {
        UUID productId = UUID.randomUUID();
        OrderRequestDto dto = OrderRequestDto.builder()
                .address(AddressDto.builder().country("RO").city("Cluj").county("Cluj").streetAddress("Str 1").build())
                .items(List.of(
                        OrderItemRequestDto.builder().productId(productId).quantity(3).build()
                ))
                .build();

        Order order = mapper.toEntity(dto);

        assertThat(order.getOrderDetails()).hasSize(1);
        assertThat(order.getOrderDetails().iterator().next().getProduct().getId()).isEqualTo(productId);
        assertThat(order.getOrderDetails().iterator().next().getQuantity()).isEqualTo(3);
    }
}
