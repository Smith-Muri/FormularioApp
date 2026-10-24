package com.example.PaseoAPP.servicios;

import com.example.PaseoAPP.dtos.UsuarioDTO;
import com.example.PaseoAPP.enums.Rol;
import com.example.PaseoAPP.mapeadores.IMapaUsuario;
import com.example.PaseoAPP.modelos.Usuario;
import com.example.PaseoAPP.repositorios.IRepositorioUsuario;
import com.example.PaseoAPP.validadores.IValidadorUsuario;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioServicioImpl implements IUsuarioServicio {

    //1. Llamar a los helpers o dependencias que necesite
    private final IMapaUsuario mapaUsuario;
    private final IRepositorioUsuario repositorioUsuario;

    private final IValidadorUsuario validadorUsuario;
    private final PasswordEncoder passwordEncoder;


    public UsuarioServicioImpl(IMapaUsuario mapaUsuario, IRepositorioUsuario repositorioUsuario, IValidadorUsuario validadorUsuario, PasswordEncoder passwordEncoder) {
        this.mapaUsuario = mapaUsuario;
        this.repositorioUsuario = repositorioUsuario;
        this.validadorUsuario = validadorUsuario;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UsuarioDTO guardarUsuarioEnBD(Usuario datos) {

        this.validadorUsuario.validarNuevoUsuario(datos);
        datos.setContraseña(passwordEncoder.encode(datos.getContraseña()));
        datos.setId(null);
        datos.setRol(Rol.USUARIO);

        Usuario usuarioGuardado=this.repositorioUsuario.save(datos);
        return this.mapaUsuario.convertir_modelo_a_dto(usuarioGuardado);

    }

    @Override
    public UsuarioDTO modificarUsuarioEnBD(Usuario datos, UUID id) {

        //Buscando que el usuario exista en BD
        Optional<Usuario> usuarioQueEstoyBuscando=this.repositorioUsuario.findById(id);
        if(usuarioQueEstoyBuscando.isEmpty()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"usuario no encontrado");
        }
        //encontre el usuario
        Usuario usuarioQueEncontre=usuarioQueEstoyBuscando.get();


        //validando los datos con los que voy a editar
        this.validadorUsuario.validarDatosModificacion(datos);

        //Incluir validaciones (proximamente) y validar los datos nuevos
        //Aplicar los cambios
        usuarioQueEncontre.setNombres(datos.getNombres());
        Usuario usuarioModificado=this.repositorioUsuario.save(usuarioQueEncontre);

        //convierto la rspuesta a DTO
        return this.mapaUsuario.convertir_modelo_a_dto(usuarioModificado);


    }

    @Override
    public List<UsuarioDTO> buscarUsuariosEnBD() {

        List<Usuario> usuariosEncontrados=this.repositorioUsuario.findAll();
        return this.mapaUsuario.convertir_lista_de_modelo_a_lista_de_dto(usuariosEncontrados);

    }

    @Override
    public void eliminarUsuarioEnBD(UUID id) {
        Optional<Usuario> usuarioQueEstoyBuscando=this.repositorioUsuario.findById(id);
        if(usuarioQueEstoyBuscando.isEmpty()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"usuario no encontrado");
        }
        this.repositorioUsuario.deleteById(id);

    }
}
