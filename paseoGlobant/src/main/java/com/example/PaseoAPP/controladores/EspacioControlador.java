package com.example.PaseoAPP.controladores;

import com.example.PaseoAPP.modelos.Espacio;
import com.example.PaseoAPP.modelos.FotoEspacio;
import com.example.PaseoAPP.servicios.EspacioServicio;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/paseoapi/v1/espacios")
public class EspacioControlador {

    //Por cada serivicio ofrecido
    //configuro 1 funcion controladora

    private final EspacioServicio servicio;

    public EspacioControlador(EspacioServicio servicio) {
        this.servicio = servicio;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Espacio>controlarGuardado(@RequestBody Espacio datos){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(this.servicio.guardarEspacioEnBD(datos));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Espacio> controlarGuardadoConFoto(
            @RequestPart("espacio") Espacio datos,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.guardarEspacioEnBD(datos, foto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Espacio>controlarModificado(@RequestBody Espacio datos, @PathVariable UUID id){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(this.servicio.modificarEspacioEnBD(datos,id));
    }

    //funcion para controlar el borrado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> controlarBorrado(@PathVariable UUID id){
        this.servicio.eliminarEspacioEnBD(id);
        return ResponseEntity.noContent().build();
    }


    //funcion para controlar el listar
    @GetMapping
    public ResponseEntity<?>controlarListado(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(this.servicio.buscarEspaciosEnBD());
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFoto(@PathVariable UUID id) {
        FotoEspacio foto = servicio.buscarFoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.getTipoContenido()))
                .cacheControl(CacheControl.noCache())
                .body(foto.getContenido());
    }

}
