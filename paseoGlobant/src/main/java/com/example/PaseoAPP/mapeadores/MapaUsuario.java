package com.example.PaseoAPP.mapeadores;

import com.example.PaseoAPP.dtos.UsuarioDTO;
import com.example.PaseoAPP.modelos.Usuario;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MapaUsuario implements IMapaUsuario {

    @Override
    public UsuarioDTO convertir_modelo_a_dto(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombres(),
                usuario.getCorreo(),
                usuario.getRol());
    }

    @Override
    public List<UsuarioDTO> convertir_lista_de_modelo_a_lista_de_dto(List<Usuario> usuarios) {
        return usuarios.stream().map(this::convertir_modelo_a_dto).toList();
    }
}
