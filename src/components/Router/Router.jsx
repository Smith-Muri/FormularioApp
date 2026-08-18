import {Routes, Route, Link} from 'react-router-dom'


import {Registro} from '../pages/Registro/Registro'

export function Router(){
    return(
        <>

            <Routes>
                <Route path="/" element={<Registro/>} />
                <Route path="/registro" element={<Registro/>} />
            </Routes>

        </>
    )
}