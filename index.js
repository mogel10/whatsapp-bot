const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

// Acá guardamos el estado de cada conversación
const conversaciones = {};

app.post('/bot', (req, res) => {
  const numero = req.body.From;
  const mensaje = req.body.Body.trim().toLowerCase();

  // Si es la primera vez que escribe, arrancamos
  if (!conversaciones[numero]) {
    conversaciones[numero] = { paso: 'inicio' };
  }

  const estado = conversaciones[numero];
  let respuesta = '';

  if (estado.paso === 'inicio') {
    respuesta = '¡Hola! 👋 Soy el bot de prueba. ¿Cómo te llamás?';
    estado.paso = 'esperando_nombre';

  } else if (estado.paso === 'esperando_nombre') {
    const nombre = req.body.Body.trim();
    estado.nombre = nombre;
    respuesta = `¡Buenas, ${nombre}! 😊 ¿En qué te puedo ayudar?\n\n1. Ver un chiste\n2. Ver la hora\n3. Reiniciar`;
    estado.paso = 'menu';

  } else if (estado.paso === 'menu') {
    if (mensaje === '1') {
      respuesta = '😂 ¿Por qué los programadores confunden Halloween con Navidad? Porque OCT 31 = DEC 25';
      respuesta += '\n\nEscribí *3* para reiniciar o *2* para ver la hora.';
    } else if (mensaje === '2') {
      const hora = new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
      respuesta = `🕐 Son las ${hora} (hora Argentina)`;
      respuesta += '\n\nEscribí *3* para reiniciar o *1* para un chiste.';
    } else if (mensaje === '3') {
      delete conversaciones[numero];
      respuesta = '🔄 Reiniciando...\n\n¡Hola! 👋 Soy el bot de prueba. ¿Cómo te llamás?';
      conversaciones[numero] = { paso: 'esperando_nombre' };
    } else {
      respuesta = `No entendí eso, ${estado.nombre}. Escribí *1*, *2* o *3*.`;
    }
  }

  // Responder en formato que entiende Twilio
  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${respuesta}</Message></Response>`);
});

app.get('/', (req, res) => res.send('Bot funcionando ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
