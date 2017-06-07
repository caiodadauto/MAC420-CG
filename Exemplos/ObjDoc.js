var ObjDoc = function(data) {
    this.vertices = [];                                 //Armazena os vertices em ordem de renderizacao
    this.normalsFlat = [];                                  //Armazena as normais referentes a cada vertice a ser renderizado
    this.normalsSmooth = [];                                  //Armazena as normais referentes a cada vertice a ser renderizado
    this.faces = [];                                    //Armazena as faces e suas normais lidas direto do .obj
    this.verticesAndNormals = [];                       //Armazena os vertices e as normais lidos do .obj
    this.loadObjFile(data);                             //Le o arquivo .obj e carrega as faces, normais e vertices
};

ObjDoc.prototype.parseVertex = function(string){
    var x = parseFloat(string[1]) 
    var y = parseFloat(string[2])
    var z = parseFloat(string[3])
    return vec4(x, y, z, 1);
};

ObjDoc.prototype.parseNormal = function(string){
    var x = parseFloat(string[1]);
    var y = parseFloat(string[2]);
    var z = parseFloat(string[3]);
    return vec4(x, y, z, 0);
};

ObjDoc.prototype.parseFace = function(string){
    var face = [];
    var tam = string.length;
    var n;
    var v;
    var values = new Array();
    if(tam === 5){                                      //tam = 5 faz referencia a arquivos .obj com faces quadradas
        if((string[1].split('/')).length < 3){          //length < 3 faz refencia a aruivos .obj sem normais
            for(i = 1; i < 4; i++){                     //Comeca em 1 pois 0 é o parametro 'f'
                values = string[i].split('/');
                v = Math.abs(parseInt(values[0]));      //v é o vertice 'i' desta face
                face.push([v]);
            }
            face.push(face[0]);                         //Grava duas vezes os vertices '0' e '2' para dividir o quadrado em 2 triangulos
            face.push(face[2]);
            values = string[4].split('/')
            v = Math.abs(parseInt(values[0]));
            face.push([v]);
        } else{                                         //Arquivo .obj com normais e face quadrada
            for(i = 1; i < 4; i++){
                values = string[i].split('/');
                v = Math.abs(parseInt(values[0]));
                n = Math.abs(parseInt(values[2]));
                face.push([v, n]);
            }
            face.push(face[0]);
            face.push(face[2]);
            values = string[4].split('/')
            v = Math.abs(parseInt(values[0]));
            n = Math.abs(parseInt(values[2]));
            face.push([v, n]);
        }
    } else{                                             //Arquivo .obj com faces triangulares
        if((string[1].split('/')).length < 3){          //Sem normais especificadas
            for(i = 1; i < tam; i++){
                values = string[i].split('/');
                v = Math.abs(parseInt(values[0]));
                face.push([v]);
            }
        } else{                                         //Com normais especificadas
            for(i = 1; i < tam; i++){
                values = string[i].split('/');
                v = Math.abs(parseInt(values[0]));
                n = Math.abs(parseInt(values[2]));
                face.push([v, n]);
            }
        }
    }
    return face;
};

ObjDoc.prototype.loadObjFile = function(data){
    var k;
    var pass;
    var facesNormal = [];
    var i = 0;
    var j = 0;
    var line;
    var string;
    var indexV;
    var indexN;
    var normal;
    var indexs = new Array(3);
    var verticesAndNormals = [];
    var lines = data.split('\n');

    lines.push(null);
    verticesAndNormals[0] = new Array();                //Armazenara os vertices lidos do .obj
    verticesAndNormals[1] = new Array();                //Armazenara as normais lidas do .obj
    while ((line = lines[i++]) != null) {
        while(line.search("  ") != -1)                  //Procura por espacos dublos e os troca por espacos simples
            line = line.replace("  ", " ");
        string = line.split(' ');
        if(string[0] === null)
            continue;
        switch(string[0]){
            case '#':
                continue;
            case 'v':
                var vertex = this.parseVertex(string);
                verticesAndNormals[0].push(vertex);
                continue;
            case 'vn':
                var normal = this.parseNormal(string);
                verticesAndNormals[1].push(normal);
                continue;
            case 'f':
                var face = this.parseFace(string);
                if(face.length > 3){                    //Faces quadradas
                    this.faces.push([face[0], face[1], face][2]);
                    this.faces.push([face[3], face[4], face][5]);
                } else                                  //Faces triangulares
                    this.faces.push(face);
                continue;
        }
    }
    this.faces.push(null);
    this.verticesAndNormals = verticesAndNormals;
    var size = this.faces[0][0].length;

    for(i = 1; i <= this.verticesAndNormals[0].length; i++){
        facesNormal[i - 1] = []
        for(k = 0; this.faces[k] != null; k++){
            pass = false;
            for(j = 0; j < 3; j++){
                if(i === this.faces[k][j][0]){
                    pass = true;
                    break;
                }
            }
            if(pass){
                facesNormal[i - 1].push(k);
                //Determina um numero suficiente de faces adjacentes
                //if(facesNormal[i - 1].length === 6)
                //    break;
            }
        }
    }

//-----------------FLAT----------------------------------------------
    //Se o numero de vertices for maior que o numero de normais, o .obj lido esta em flat shading
    if(size == 2){
        if(this.verticesAndNormals[1].length > this.verticesAndNormals[0].length){
            for(i = 0; this.faces[i] != null; i++){
                for(j = 0; j < 3; j++){
                    indexV = this.faces[i][j][0] - 1;
                    indexN = this.faces[i][j][1] - 1;
                    this.vertices.push(this.verticesAndNormals[0][indexV]);   
                    this.normalsFlat.push(this.verticesAndNormals[1][indexN]);   
                }
            }
        //Caso contrario o .obj esta em smooth shading
        }
        console.log(this.normalsFlat.length);
        if(this.verticesAndNormals[1].length === this.verticesAndNormals[0].length){
            for(i = 0; this.faces[i] != null; i++){
                for(j = 0; j < 3; j++){
                    indexV = this.faces[i][j][0] - 1;
                    indexN = this.faces[i][j][1] - 1;
                    this.vertices.push(this.verticesAndNormals[0][indexV]);   
                    this.normalsSmooth.push(this.verticesAndNormals[1][indexN]);
                }
            }  
        }
    } else{
         if(this.verticesAndNormals[1].length > this.verticesAndNormals[0].length){
            for(i = 0; this.faces[i] != null; i++){
                for(j = 0; j < 3; j++){
                    indexV = this.faces[i][j][0] - 1;
                    this.vertices.push(this.verticesAndNormals[0][indexV]);   
                    this.normalsFlat.push(this.verticesAndNormals[1][indexV]);   
                }
            }
        }
        if(this.verticesAndNormals[1].length === this.verticesAndNormals[0].length){
            for(i = 0; this.faces[i] != null; i++){
                for(j = 0; j < 3; j++){
                    indexV = this.faces[i][j][0] - 1;
                    this.vertices.push(this.verticesAndNormals[0][indexV]);   
                    this.normalsSmooth.push(this.verticesAndNormals[1][indexV]);
                }
            }  
        } else{
            for(i = 0; this.faces[i] != null; i++){
                //Cria as normais de cada face
                for(j = 0; j < 3; j++)
                    indexs[j] = this.faces[i][j][0] - 1;
                var t1 = subtract(this.verticesAndNormals[0][indexs[1]], this.verticesAndNormals[0][indexs[0]]);
                var t2 = subtract(this.verticesAndNormals[0][indexs[2]], this.verticesAndNormals[0][indexs[0]]);
                normal = vec4(cross(t1, t2), 0);
                this.verticesAndNormals[1].push(normal);
                //Repete as normais da face 'i' a todos os vertices desta mesma face
                for(j = 0; j < 3; j++){
                    this.vertices.push(this.verticesAndNormals[0][index[j]]);   
                    this.normalsFlat.push(this.verticesAndNormals[1][index[j]]);   
                }
            }
            facesNormal.push(null);
            var normals = this.verticesAndNormals[1];
            this.verticesAndNormals[1] = [];
            for(i = 0; facesNormal[i] != null; i++){
                var normal = vec4(0, 0, 0, 0);
                for(j = 0; j < facesNormal[i].length; j++)
                    //Soma as normais das faces adjacentes ao vertice i, * 3 pois as normais vao de 3 em 3
                    normal = add(normal, normals[facesNormal[i][j]]);
                this.verticesAndNormals[1].push(normal);
            }      
            for(i = 0; this.faces[i] != null; i++){
                for(j = 0; j < 3; j++){
                    indexV = this.faces[i][j][0] - 1;
                    this.vertices.push(this.verticesAndNormals[0][indexV]);
                    this.normalsSmooth.push(this.verticesAndNormals[1][indexV]);   
                }
            }           
        }
    }
    if(this.normalsFlat.length > 0){
        facesNormal.push(null);
        var normals = this.verticesAndNormals[1];
        this.verticesAndNormals[1] = [];
        for(i = 0; facesNormal[i] != null; i++){
            var normal = vec4(0, 0, 0, 0);
            for(j = 0; j < facesNormal[i].length; j++)
                //Soma as normais das faces adjacentes ao vertice i, * 3 pois as normais vao de 3 em 3
                normal = add(normal, normals[facesNormal[i][j]]);
            this.verticesAndNormals[1].push(normal);
        }
        for(i = 0; this.faces[i] != null; i++){
            for(j = 0; j < 3; j++){
                indexV = this.faces[i][j][0] - 1;
                this.vertices.push(this.verticesAndNormals[0][indexV]);
                this.normalsSmooth.push(this.verticesAndNormals[1][indexV]);   
            }
        }
    } else{
        this.verticesAndNormals[1] = [];
        for(i = 0; this.faces[i] != null; i++){
            //Cria as normais de cada face
            for(j = 0; j < 3; j++)
                indexs[j] = this.faces[i][j][0] - 1;
            var t1 = subtract(this.verticesAndNormals[0][indexs[1]], this.verticesAndNormals[0][indexs[0]]);
            var t2 = subtract(this.verticesAndNormals[0][indexs[2]], this.verticesAndNormals[0][indexs[0]]);
            normal = vec4(cross(t1, t2), 0);
            this.verticesAndNormals[1].push(normal);
            //Repete as normais da face 'i' a todos os vertices desta mesma face
            for(j = 0; j < 3; j++){
                this.vertices.push(this.verticesAndNormals[0][indexs[j]]);   
                this.normalsFlat.push(this.verticesAndNormals[1][indexs[j]]);   
            }
        }
    }
};

/*ObjDoc.prototype.loadObjFileSmooth = function(){
    if(this.shading === 's')
        return;
    var i;
    var j;
    var k;
    var pass;
    var facesNormal = [];                               //Armazenara as faces adjacentes a cada vertice
    //Se o numero de vertices e de normais nao forem iguais o .obj nao esta em smooth shading
    if(this.verticesAndNormals[1].length !== this.verticesAndNormals[0].length){
        //Determina as faces 'k' adjacentes a cada vertice 'i'

    //Caso o .obj ja esteja em smooth shading
    } else{
        for(i = 0; this.faces[i] != null; i++){
            for(j = 0; j < 3; j++){
                indexV = this.faces[i][j][0] - 1;
                indexN = this.faces[i][j][1] - 1;
                this.vertices.push(this.verticesAndNormals[0][indexV]);   
                this.normals.push(this.verticesAndNormals[1][indexN]);   
            }
        }   
    }
    this.shading = 's';
};*/
//var t1 = subtract(verticesAux[this.faces[normalFace[i][j]][1][0] - 1], verticesAux[this.faces[normalFace[i][j]][0][0] - 1]);
//var t2 = subtract(verticesAux[this.faces[normalFace[i][j]][2][0] - 1], verticesAux[this.faces[normalFace[i][j]][0][0] - 1]);
//normal = add(normal, cross(t1, t2));
