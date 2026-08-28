const avaliarForm = document.getElementById("avaliarForm");

avaliarForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // ======================================
    // PEGAR DADOS DO FORMULÁRIO
    // ======================================
    const titulo = document.getElementById("titulo").value.trim();
    const ano = document.getElementById("ano").value;
    const genero = document.getElementById("genero").value.trim();
    const poster = document.getElementById("poster").value.trim();
    const nota = Number(document.getElementById("nota").value);
    const dataAssistido = document.getElementById("data").value;
    const comentario = document.getElementById("comentario").value.trim();

    try {
        const { data: filme, error: filmeError } = await supabaseClient
            .from("filmes")
            .insert({
                titulo: titulo,
                ano: ano ? Number(ano) : null,
                genero: genero || null,
                poster_url: poster || null
            })
            .select()
            .single();

        if (filmeError) {
            throw filmeError;
        }

        const { error: avaliacaoError } = await supabaseClient
            .from("avaliacoes")
            .insert({
                filme_id: filme.id, 
                nota: nota,
                comentario: comentario || null,
                data_assistido: dataAssistido || null,
                nome_usuario: "Anônimo" 
            });

        if (avaliacaoError) {
            throw avaliacaoError;
        }

        alert("Filme avaliado com sucesso! 🎬");
        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar: " + error.message);
    }
});