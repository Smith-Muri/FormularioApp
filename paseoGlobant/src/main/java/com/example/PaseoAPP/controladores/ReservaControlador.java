package com.example.PaseoAPP.controladores;

import com.example.PaseoAPP.dtos.ReservaDTO;
import com.example.PaseoAPP.dtos.SolicitudReserva;
import com.example.PaseoAPP.modelos.Reserva;
import com.example.PaseoAPP.servicios.ReservaServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/paseoapi/v1/reservas")
public class ReservaControlador {

    //Por cada serivicio ofrecido
    //configuro 1 funcion controladora

    private final ReservaServicio servicio;

    public ReservaControlador(ReservaServicio servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public ResponseEntity<ReservaDTO> controlarGuardado(
            @RequestBody SolicitudReserva datos,
            Authentication autenticacion) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(servicio.guardarReservaEnBD(datos, autenticacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> controlarModificado(
            @RequestBody SolicitudReserva datos,
            @PathVariable UUID id,
            Authentication autenticacion) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(servicio.modificarReservaEnBD(datos, id, autenticacion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> controlarBorrado(@PathVariable UUID id, Authentication autenticacion){
        servicio.eliminarReservaEnBD(id, autenticacion);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<?> controlarListado(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(this.servicio.buscarReservasEnBD());
    }

}
