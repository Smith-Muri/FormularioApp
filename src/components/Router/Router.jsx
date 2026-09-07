import {Routes, Route} from 'react-router-dom'


import {Registro} from '../pages/Registro/Registro'
import {Home} from '../pages/Home/Home'
import {Espacio} from '../pages/Espacio/Espacio'
import {Reserva} from '../pages/Reserva/Reserva'

export function Router(){
    return(
        <>

            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/registro" element={<Registro/>} />
                <Route path="/espacios" element={<Espacio/>} />
                <Route path="/reservas" element={<Reserva/>} />
            </Routes>

        </>
    )
}