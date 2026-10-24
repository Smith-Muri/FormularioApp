package com.example.PaseoAPP.mapeadores;

import com.example.PaseoAPP.dtos.UsuarioDTO;
import com.example.PaseoAPP.modelos.Usuario;

import java.util.List;

public interface IMapaUsuario {

    UsuarioDTO convertir_modelo_a_dto(Usuario usuario);
    List<UsuarioDTO> convertir_lista_de_modelo_a_lista_de_dto(List<Usuario>lista);
}
