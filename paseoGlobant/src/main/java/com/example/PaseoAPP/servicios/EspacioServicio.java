package com.example.PaseoAPP.servicios;

import com.example.PaseoAPP.modelos.Espacio;
import com.example.PaseoAPP.modelos.FotoEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioFotoEspacio;
import com.example.PaseoAPP.repositorios.IRepositorioReserva;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class EspacioServicio {

    private final IRepositorioEspacio repositorio;
    private final IRepositorioFotoEspacio fotos;
    private final IRepositorioReserva reservas;
    private final ValidadorImagen validadorImagen;

    public EspacioServicio(
            IRepositorioEspacio repositorio,
            IRepositorioFotoEspacio fotos,
            IRepositorioReserva reservas,
            ValidadorImagen validadorImagen) {
        this.repositorio = repositorio;
        this.fotos = fotos;
        this.reservas = reservas;
        this.validadorImagen = validadorImagen;
    }

    @Transactional
    public Espacio guardarEspacioEnBD(Espacio datos) {
        datos.setId(null);
        return repositorio.save(datos);
    }

    @Transactional
    public Espacio guardarEspacioEnBD(Espacio datos, MultipartFile archivo) {
        ValidadorImagen.ImagenValidada imagen = archivo == null || archivo.isEmpty()
                ? null : validadorImagen.validar(archivo);
        datos.setId(null);
        Espacio guardado = repositorio.save(datos);
        if (imagen != null) {
            fotos.save(new FotoEspacio(guardado, imagen.contenido(), imagen.tipoContenido()));
            guardado.setFoto("/paseoapi/v1/espacios/" + guardado.getId() + "/foto");
            guardado = repositorio.save(guardado);
        }
        return guardado;
    }

    @Transactional(readOnly = true)
    public FotoEspacio buscarFoto(UUID id) {
        if (!repositorio.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado.");
        }
        return fotos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este espacio no tiene una imagen cargada."));
    }

    public Espacio modificarEspacioEnBD(Espacio datos, UUID id) {
        Espacio existente = buscarPorId(id);
        existente.setNombre(datos.getNombre());
        existente.setDescripcion(datos.getDescripcion());
        if (datos.getFoto() != null) {
            existente.setFoto(datos.getFoto());
        }
        existente.setAforo(datos.getAforo());
        return repositorio.save(existente);
    }

    @Transactional
    public void eliminarEspacioEnBD(UUID id) {
        buscarPorId(id);
        if (reservas.existsByEspacio_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar un espacio que ya tiene reservas.");
        }
        fotos.deleteById(id);
        repositorio.deleteById(id);
    }

    public List<Espacio> buscarEspaciosEnBD() {
        return repositorio.findAll();
    }

    private Espacio buscarPorId(UUID id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
    }
}
