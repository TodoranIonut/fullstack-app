package msg.onlineshopapi.controller;

import msg.onlineshopapi.config.TestSecurityConfig;
import msg.onlineshopapi.dto.SupplierResponseDto;
import msg.onlineshopapi.dto.mapper.SupplierMapper;
import msg.onlineshopapi.model.Supplier;
import msg.onlineshopapi.security.JwtService;
import msg.onlineshopapi.service.SupplierService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SupplierController.class)
@Import(TestSecurityConfig.class)
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupplierService supplierService;

    @MockitoBean
    private SupplierMapper supplierMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private final UUID supplierId = UUID.randomUUID();

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getAll_returnsSuppliers() throws Exception {
        Supplier supplier = Supplier.builder().id(supplierId).name("TechSource Ltd").build();
        SupplierResponseDto dto = supplierDto(supplierId, "TechSource Ltd");

        when(supplierService.findAll()).thenReturn(List.of(supplier));
        when(supplierMapper.toDto(supplier)).thenReturn(dto);

        mockMvc.perform(get("/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(supplierId.toString()))
                .andExpect(jsonPath("$[0].name").value("TechSource Ltd"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returns200_whenFound() throws Exception {
        Supplier supplier = Supplier.builder().id(supplierId).name("TechSource Ltd").build();
        SupplierResponseDto dto = supplierDto(supplierId, "TechSource Ltd");

        when(supplierService.findById(supplierId)).thenReturn(Optional.of(supplier));
        when(supplierMapper.toDto(supplier)).thenReturn(dto);

        mockMvc.perform(get("/suppliers/{id}", supplierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.name").value("TechSource Ltd"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returns404_whenNotFound() throws Exception {
        when(supplierService.findById(supplierId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/suppliers/{id}", supplierId))
                .andExpect(status().isNotFound());
    }

    private SupplierResponseDto supplierDto(UUID id, String name) {
        return SupplierResponseDto.builder()
                .id(id)
                .name(name)
                .contactEmail("contact@techsource.com")
                .phoneNumber("+40 720 000 001")
                .build();
    }
}
