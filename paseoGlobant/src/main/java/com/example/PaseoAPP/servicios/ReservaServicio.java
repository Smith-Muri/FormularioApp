package com.example.PaseoAPP.servicios;

import com.example.PaseoAPP.dtos.ReservaDTO;
import com.example.PaseoAPP.dtos.SolicitudReserva;
import com.example.PaseoAPP.enums.Rol;
import com.example.PaseoAPP.modelos.Espacio;
import com.example.PaseoAPP.modelos.Reserva;
import com.example.PaseoAPP.modelos.Usuario;
import com.example.PaseoAPP.repositorios.IRepositorioEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioReserva;
import com.example.PaseoAPP.repositorios.IRepositorioUsuario;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class ReservaServicio {

    private final IRepositorioReserva repositorio;
    private final IRepositorioEspacio espacios;
    private final IRepositorioUsuario usuarios;

    public ReservaServicio(
            IRepositorioReserva repositorio,
            IRepositorioEspacio espacios,
            IRepositorioUsuario usuarios) {
        this.repositorio = repositorio;
        this.espacios = espacios;
        this.usuarios = usuarios;
    }

    @Transactional
    public ReservaDTO guardarReservaEnBD(SolicitudReserva solicitud, Authentication autenticacion) {
        validarSolicitud(solicitud);
        Espacio espacio = bloquearEspacio(solicitud.espacioId());
        LocalDateTime inicio = analizarFecha(solicitud.fecha());
        int duracion = analizarDuracion(solicitud.tiempo());
        validarSinCruce(solicitud.espacioId(), inicio, duracion, null);

        Usuario usuario = usuarios.findByCorreo(autenticacion.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para reservar."));
        Reserva reserva = new Reserva();
        reserva.setFecha(solicitud.fecha());
        reserva.setTiempo(Integer.toString(duracion));
        reserva.setEspacio(espacio);
        reserva.setUsuario(usuario);
        return convertir(repositorio.save(reserva));
    }

    @Transactional
    public ReservaDTO modificarReservaEnBD(
            SolicitudReserva solicitud,
            UUID id,
            Authentication autenticacion) {
        validarSolicitud(solicitud);
        Reserva existente = buscarReservaEditable(id, autenticacion);
        bloquearEspacios(existente.getEspacio() == null ? null : existente.getEspacio().getId(), solicitud.espacioId());
        Espacio espacio = espacios.findById(solicitud.espacioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado."));
        LocalDateTime inicio = analizarFecha(solicitud.fecha());
        int duracion = analizarDuracion(solicitud.tiempo());
        validarSinCruce(solicitud.espacioId(), inicio, duracion, existente.getId());

        existente.setFecha(solicitud.fecha());
        existente.setTiempo(Integer.toString(duracion));
        existente.setEspacio(espacio);
        return convertir(repositorio.save(existente));
    }

    @Transactional
    public void eliminarReservaEnBD(UUID id, Authentication autenticacion) {
        repositorio.delete(buscarReservaEditable(id, autenticacion));
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO> buscarReservasEnBD() {
        return repositorio.findByOrderByFechaAsc().stream()
                .map(this::convertir)
                .toList();
    }

    private void validarSolicitud(SolicitudReserva solicitud) {
        if (solicitud == null || solicitud.espacioId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un espacio para reservar.");
        }
        analizarFecha(solicitud.fecha());
        analizarDuracion(solicitud.tiempo());
    }

    private LocalDateTime analizarFecha(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona la fecha y hora de la reserva.");
        }
        try {
            LocalDateTime fecha = LocalDateTime.parse(valor);
            if (!fecha.isAfter(LocalDateTime.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva debe ser en una fecha y hora futura.");
            }
            return fecha;
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de la reserva no tiene un formato válido.");
        }
    }

    private int analizarDuracion(String valor) {
        try {
            int minutos = Integer.parseInt(valor);
            if (minutos < 1 || minutos > 1440) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La duración debe estar entre 1 y 1440 minutos.");
            }
            return minutos;
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresa una duración válida en minutos.");
        }
    }

    private Espacio bloquearEspacio(UUID id) {
        return espacios.bloquearPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El espacio seleccionado no existe."));
    }

    private void bloquearEspacios(UUID actual, UUID destino) {
        List<UUID> ids = Stream.of(actual, destino)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparing(UUID::toString))
                .toList();
        ids.forEach(this::bloquearEspacio);
    }

    private void validarSinCruce(UUID espacioId, LocalDateTime inicio, int duracion, UUID reservaIgnorada) {
        LocalDateTime fin = inicio.plusMinutes(duracion);
        boolean cruza = repositorio.findByEspacio_Id(espacioId).stream()
                .filter(reserva -> !reserva.getId().equals(reservaIgnorada))
                .anyMatch(reserva -> {
                    LocalDateTime inicioExistente = analizarFechaSinFuturo(reserva.getFecha());
                    LocalDateTime finExistente = inicioExistente.plusMinutes(analizarDuracion(reserva.getTiempo()));
                    return inicio.isBefore(finExistente) && inicioExistente.isBefore(fin);
                });
        if (cruza) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese horario ya está reservado para este espacio. Elige otra hora.");
        }
    }

    private LocalDateTime analizarFechaSinFuturo(String valor) {
        try {
            return LocalDateTime.parse(valor);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Existe una reserva antigua con una fecha inválida; contacta al administrador.");
        }
    }

    private Reserva buscarReservaEditable(UUID id, Authentication autenticacion) {
        boolean administrador = autenticacion.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + Rol.ADMINISTRADOR.name()));
        return (administrador
                ? repositorio.findById(id)
                : repositorio.findByIdAndUsuario_Correo(id, autenticacion.getName()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    private ReservaDTO convertir(Reserva reserva) {
        Espacio espacio = reserva.getEspacio();
        return new ReservaDTO(
                reserva.getId(),
                espacio == null ? null : espacio.getId(),
                espacio == null ? "Espacio eliminado" : espacio.getNombre(),
                reserva.getFecha(),
                reserva.getTiempo());
    }
}
