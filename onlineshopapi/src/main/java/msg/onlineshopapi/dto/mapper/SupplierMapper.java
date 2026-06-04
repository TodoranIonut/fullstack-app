package msg.onlineshopapi.dto.mapper;

import msg.onlineshopapi.dto.SupplierResponseDto;
import msg.onlineshopapi.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponseDto toDto(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        return SupplierResponseDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactEmail(supplier.getContactEmail())
                .phoneNumber(supplier.getPhoneNumber())
                .build();
    }
}
