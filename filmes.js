// ==========================================
// CARREGAR FILMES
// ==========================================

async function carregarFilmes() {
    const container = document.getElementById("filmesContainer");
    container.innerHTML = "<p>Carregando...</p>";

    const { data, error } = await supabaseClient
        .from("avaliacoes")
        .select(`
            id,
            nota,
            comentario,
            data_assistido,
            filmes (
                id,
                titulo,
                ano,
                genero,
                poster_url
            )
        `)
        .order("criado_em", { ascending: false });

    if (error) {
        console.error(error);
        container.innerHTML = "<p>Erro ao carregar filmes.</p>";
        return;
    }

    mostrarFilmes(data);
}

// ==========================================
// MOSTRAR FILMES
// ==========================================

function mostrarFilmes(avaliacoes) {
    const container = document.getElementById("filmesContainer");
    container.innerHTML = "";

    if (!avaliacoes || !avaliacoes.length) {
        container.innerHTML = `
            <div class="vazio">
                <h3>🎬 Nenhum filme ainda</h3>
                <p>Comece avaliando seu primeiro filme!</p>
            </div>
        `;
        return;
    }

    avaliacoes.forEach(item => {
        const  filme = item.filmes;

        if (!filme) return;

        const poster = filme.poster_url || "https://via.placeholder.com/300x450?text=Sem+Poster";
        const card = document.createElement("article");
        card.className = "filme-card";

        const comentarioTratado = item.comentario ? item.comentario.replace(/"/g, '&quot;').replace(/'/g, "\\'") : "";

        card.innerHTML = `
            <img src="${poster}" alt="${filme.titulo}">
            <div class="filme-info">
                <h3>${filme.titulo}</h3>
                <p>${filme.ano || ""}</p>
                <p class="nota">⭐ ${item.nota}</p>
                ${
                    item.comentario
                    ? `<p class="comentario">"${item.comentario}"</p>`
                    : ""
                }
                
                <!-- Botões de Ação inseridos aqui -->
                <div class="card-acoes">
                    <button class="btn-acao btn-editar" title="Editar" onclick="abrirModalEditar('${item.id}', '${item.nota}', '${comentarioTratado}')">✏️</button>
                    <button class="btn-acao btn-deletar" title="Excluir" onclick="excluirAvaliacao('${item.id}')">🗑️</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==========================================
// BUSCA
// ==========================================

const busca = document.getElementById("buscar");

if (busca) {
    busca.addEventListener("input", async function() {
        const termo = busca.value.trim().toLowerCase();

        if (!termo) {
            carregarFilmes();
            return;
        }

        const { data, error } = await supabaseClient
            .from("avaliacoes")
            .select(`
                id,
                nota,
                comentario,
                filmes!inner (
                    id,
                    titulo,
                    ano,
                    genero,
                    poster_url
                )
            `)
            .ilike("filmes.titulo", `%${termo}%`);

        if (error) {
            console.error("Erro na busca:", error);
            return;
        }

        mostrarFilmes(data);
    });
}

// ==========================================
// COMPARTILHAR 
// ==========================================

const compartilharBtn = document.getElementById("compartilharBtn");

if (compartilharBtn) {
    compartilharBtn.addEventListener("click", async function() {
        // Usamos o pathname para capturar a pasta correta do repositório no GitHub Pages automaticamente
        const rascunhoPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        const linkCompartilhado = `${window.location.origin}${rascunhoPath}/compartilhado.html?user=${USUARIO_ID}`;

        try {
            await navigator.clipboard.writeText(linkCompartilhado);
            alert("🔗 Link copiado! Qualquer novo filme que você avaliar atualizará lá automaticamente.");
        } catch {
            prompt("Copie seu link de visualização abaixo:", linkCompartilhado);
        }
    });
}

// ============================
// FUNÇÕES DE EDIÇÃO E EXCLUSÃO
// ============================

function abrirModalEditar(id, nota, comentario) {
    document.getElementById('editarFilmeId').value = id;
    document.getElementById('editarNota').value = nota;
    document.getElementById('editarComentario').value = comentario;
    document.getElementById('modalEditar').style.display = 'flex';
}

function fecharModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

async function salvarEdicao() {
    const id = document.getElementById('editarFilmeId').value;
    const nota = parseInt(document.getElementById('editarNota').value);
    const comentario = document.getElementById('editarComentario').value;

    const { error } = await supabaseClient
        .from('avaliacoes')
        .update({ nota: nota, comentario: comentario })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar avaliação: ' + error.message);
    } else {
        fecharModalEditar();
        carregarFilmes();
    }
}

async function excluirAvaliacao(id) {
    const confirmacao = confirm("Tem certeza que deseja excluir esta avaliação?");
    
    if (confirmacao) {
        const { error } = await supabaseClient
            .from('avaliacoes')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir avaliação: ' + error.message);
        } else {
            carregarFilmes();
        }
    }
}

// ==========
// INSTALAÇÃO 
// ==========

let deferredPrompt;

const btnEditor = document.getElementById('btnInstalarEditor');
const btnVisualizador = document.getElementById('btnInstalarVisualizador');


function checkDisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || window.navigator.standalone
    || document.referrer.includes('android-app://');

    if (isStandalone) {
        if (btnEditor) btnEditor.style.display = 'none';
        if (btnVisualizador) btnVisualizador.style.display = 'none';
    } else {
        if (btnEditor) btnEditor.style.display = 'inline-block';
        if (btnVisualizador) btnVisualizador.style.display = 'inline-block';
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (btnEditor) btnEditor.style.display = 'inline-block';
    if (btnVisualizador) btnVisualizador.style.display = 'inline-block';
});

if (btnEditor) {
    btnEditor.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Escolha do usuário (Editor): ${outcome}`);

        deferredPrompt = null;

        // Esconde os botões após a ação
        if (btnEditor) btnEditor.style.display = 'none';
        if (btnVisualizador) btnVisualizador.style.display = 'none';
    });
}

if (btnVisualizador) {
    btnVisualizador.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        window.location.href = './compartilhado.html';

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Escolha do usuário (Visualizador): ${outcome}`);

        deferredPrompt = null;

        if (btnEditor) btnEditor.style.display = 'none';
        if (btnVisualizador) btnVisualizador.style.display = 'none';
    });
}

window.addEventListener('DOMContentLoaded', checkDisplayMode);

// ==========================================
// INICIAR
// ==========================================

carregarFilmes();
