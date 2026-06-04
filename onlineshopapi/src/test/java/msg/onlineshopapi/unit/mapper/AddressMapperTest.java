package msg.onlineshopapi.unit.mapper;

import msg.onlineshopapi.dto.AddressDto;
import msg.onlineshopapi.dto.mapper.AddressMapper;
import msg.onlineshopapi.model.Address;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AddressMapperTest {

    private final AddressMapper mapper = new AddressMapper();

    @Test
    void toDto_mapsAllFields() {
        Address address = Address.builder()
                .country("Romania")
                .city("Cluj-Napoca")
                .county("Cluj")
                .streetAddress("Str. Eroilor 10")
                .build();

        AddressDto dto = mapper.toDto(address);

        assertThat(dto.getCountry()).isEqualTo("Romania");
        assertThat(dto.getCity()).isEqualTo("Cluj-Napoca");
        assertThat(dto.getCounty()).isEqualTo("Cluj");
        assertThat(dto.getStreetAddress()).isEqualTo("Str. Eroilor 10");
    }

    @Test
    void toEntity_mapsAllFields() {
        AddressDto dto = AddressDto.builder()
                .country("Romania")
                .city("Cluj-Napoca")
                .county("Cluj")
                .streetAddress("Str. Eroilor 10")
                .build();

        Address address = mapper.toEntity(dto);

        assertThat(address.getCountry()).isEqualTo("Romania");
        assertThat(address.getCity()).isEqualTo("Cluj-Napoca");
        assertThat(address.getCounty()).isEqualTo("Cluj");
        assertThat(address.getStreetAddress()).isEqualTo("Str. Eroilor 10");
    }

    @Test
    void toEntity_returnsNull_whenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }
}
