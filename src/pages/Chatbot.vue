<script setup lang="ts">
import { ref, nextTick } from 'vue';

const title = 'NuraBot';

// Tipos
type Sender = 'user' | 'bot';

interface ChatMessage {
  id: number;
  from: Sender;
  text: string;
  time: string;
}

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    from: 'bot',
    text: '¡Hola! Soy NuraBot 💜 Estoy acá para escucharte. ¿En qué te gustaría que te acompañe hoy?',
    time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  },
]);

const userInput = ref('');
const loading = ref(false);
const errorMsg = ref('');
const chatContainer = ref<HTMLElement | null>(null);

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Scroll automático
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

// Llamada a OpenAI (Responses API)
const askNuri = async (userText: string): Promise<string> => {
  if (!apiKey) {
    throw new Error(
      'El chatbot no está configurado. Falta la API key de OpenAI en el archivo .env.local.'
    );
  }

  const history = messages.value
    .map((m) => `${m.from === 'user' ? 'Persona' : 'Nuri'}: ${m.text}`)
    .join('\n');

  const prompt = `
Eres Nuri, el chatbot de la app Nura, una plataforma de acompañamiento en salud mental y relación con la comida.
Tu tono es:
- Cercano, cálido, empático y sin juicios.
- Claro y sencillo, como si hablaras con una persona joven.
- Respetuoso con personas que atraviesan dificultades con la comida, la imagen corporal o el ánimo.

MUY IMPORTANTE:
- NO des diagnósticos ni planes de tratamiento.
- NO des recomendaciones de calorías, ayunos extremos, dietas restrictivas ni conductas de riesgo.
- Si la persona menciona ideas de hacerse daño, de dejar de comer por completo o de no querer seguir viviendo, RESPONDE SIEMPRE que es importante pedir ayuda urgente a un profesional de salud o a los servicios de emergencia de su país.
- Reforzá siempre la idea de pedir ayuda a profesionales y personas de confianza.
- Respondé en español rioplatense neutro.
- Respondé en un máximo de 4–5 líneas.

Historial de la conversación:
${history}

Mensaje nuevo de la persona usuaria:
${userText}

Ahora responde como Nuri:
`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error OpenAI:', response.status, errorBody);
    throw new Error('Hubo un problema al hablar con NuraBot. Probá de nuevo en un ratito.');
  }

  const data = await response.json();
  const content =
    data?.output?.[0]?.content?.[0]?.text ??
    'Estoy teniendo un problema para responder justo ahora, ¿te animás a intentarlo de nuevo?';

  return content.trim();
};

// Enviar mensaje
const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || loading.value) return;

  errorMsg.value = '';

  messages.value.push({
    id: Date.now(),
    from: 'user',
    text,
    time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  });

  userInput.value = '';
  await scrollToBottom();

  try {
    loading.value = true;
    const reply = await askNuri(text);

    messages.value.push({
      id: Date.now() + 1,
      from: 'bot',
      text: reply,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    });

    await scrollToBottom();
  } catch (err: any) {
    console.error(err);
    errorMsg.value =
      err?.message || 'Hubo un error inesperado. Podés intentar de nuevo más tarde.';
  } finally {
    loading.value = false;
  }
};

// Enviar con Enter
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <section class="chat-page">
    <header class="chat-header">
      <h1 class="chat-title">{{ title }}</h1>
      <p class="chat-subtitle">
        Disponible 24/7 para acompañarte. Recordá que no reemplaza la ayuda de un profesional.
      </p>
    </header>

    <div ref="chatContainer" class="chat-box">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="msg.from === 'user' ? 'message-row--user' : 'message-row--bot'"
      >
        <div
          class="bubble"
          :class="msg.from === 'user' ? 'bubble--user' : 'bubble--bot'"
        >
          <p class="bubble-text">
            {{ msg.text }}
          </p>
          <span class="bubble-meta">
            {{ msg.time }} · {{ msg.from === 'user' ? 'Vos' : 'NuraBot' }}
          </span>
        </div>
      </div>

      <p v-if="loading" class="typing">
        NuraBot está escribiendo...
      </p>
    </div>

    <p v-if="errorMsg" class="chat-error">
      {{ errorMsg }}
    </p>

    <form class="input-area" @submit.prevent="sendMessage">
      <div class="input-wrapper">
        <textarea
          v-model="userInput"
          rows="1"
          class="input-field"
          placeholder="Escribí un mensaje..."
          @keydown="onKeyDown"
        />
      </div>

      <!-- Botón mic (decorativo, sin lógica por ahora) -->
      <button type="button" class="mic-btn" aria-label="Grabar mensaje de voz (próximamente)">
        🎤
      </button>

      <button
        type="submit"
        class="send-btn"
        :disabled="loading || !userInput.trim()"
      >
        {{ loading ? 'Enviando…' : 'Enviar' }}
      </button>
    </form>

    <p class="disclaimer">
      NuraBot no reemplaza un tratamiento ni la atención de profesionales de salud. Si estás en una
      situación de emergencia, buscá ayuda inmediata en los servicios de urgencias de tu país.
    </p>
  </section>
</template>

<style scoped>
.chat-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.chat-header {
  margin-bottom: 1rem;
}

.chat-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--nura-dark);
}

.chat-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.chat-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  max-height: 480px;
  min-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.message-row {
  display: flex;
}

.message-row--bot {
  justify-content: flex-start;
}

.message-row--user {
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.bubble--bot {
  background: var(--nura);
  color: #ffffff;
  border-bottom-left-radius: 4px;
}

.bubble--user {
  background: #dff4f4; /* tono suave tipo screenshot */
  color: #123;
  border-bottom-right-radius: 4px;
}

.bubble-text {
  margin: 0;
}

.bubble-meta {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  opacity: 0.8;
  text-align: right;
}

.typing {
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.2rem;
}

/* Área de input */
.input-area {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.input-wrapper {
  flex: 1;
}

.input-field {
  width: 100%;
  border-radius: 999px;
  border: 1px solid #d3d7dd;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  background: #f4f6f8;
}

.input-field:focus {
  border-color: var(--nura);
  box-shadow: 0 0 0 2px rgba(55, 179, 179, 0.15);
}

.mic-btn {
  border: none;
  background: #e4e8f1;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}

.mic-btn:hover {
  background: #d6dced;
}

.send-btn {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  background: #6f8cff; /* azul tipo captura */
  color: #ffffff;
  transition: background 0.15s ease;
}

.send-btn:hover:enabled {
  background: #5c79f1;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.chat-error {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #d03030;
}

.disclaimer {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #777;
}

/* Responsive */
@media (max-width: 640px) {
  .chat-box {
    padding: 1rem;
    max-height: 60vh;
  }

  .bubble {
    max-width: 90%;
  }

  .input-area {
    align-items: flex-end;
  }
}
</style>
