//-------------------------------------------------//
//  Nome: Caio Vinicius Dadauto                    //
//  Nusp: 7994808                                  //
//  EP1 - Introducao a computacao grafica          //
//-------------------------------------------------//

var ObjDoc = function(data) {
    this.xCenter;
    this.yCenter;
    this.zCenter;
    this.vertices = [];                                 //Armazena os vertices em ordem de renderizacao
    this.normals = [];                                  //Armazena as normais referentes a cada vertice a ser renderizado
    this.faces = [];                                    //Armazena as faces e suas normais lidas direto do .obj
    this.verticesAndNormals = [];                       //Armazena os vertices e as normais lidos do .obj
    this.shading = 'n';                                 //Grava se o objeto esta em smooth ou flat shading
    this.loadObjFile(data);                             //Le o arquivo .obj e carrega as faces, normais e vertices
    this.max = this.maxValue();                         //Calcula o maior valor em modulo entre as coordenadas de cada vertice
    this.massCenter();                                  //Determina o centro de massa
};

ObjDoc.prototype.loadObjFile = function(data){
    var i = 0;
    var line;
    var string;
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
};

ObjDoc.prototype.loadObjFileFlat = function(){
    if(this.shading === 'f')
        return;
    var i;
    var j;
    var indexV;
    var indexN;
    var size = this.faces[0][0].length;
    this.normals = [];
    this.vertices = [];
    //Se o numero de vertices for maior que o numero de normais, o .obj lido esta em flat shading
    if(this.verticesAndNormals[1].length > this.verticesAndNormals[0].length && size == 2){
        for(i = 0; this.faces[i] != null; i++){
            for(j = 0; j < 3; j++){
                indexV = this.faces[i][j][0] - 1;
                indexN = this.faces[i][j][1] - 1;
                this.vertices.push(this.verticesAndNormals[0][indexV]);   
                this.normals.push(this.verticesAndNormals[1][indexN]);   
            }
        }
    //Caso contrario o .obj esta em smooth shading
    } else{ 
        var normal;
        var indexs = new Array(3);
        this.verticesAndNormals[1] = [];                //Exclui as normais lidas no arquivo
        for(i = 0; this.faces[i] != null; i++){
            //Cria as normais de cada face
            indexs[0] = this.faces[i][0][0] - 1;
            indexs[1] = this.faces[i][1][0] - 1;
            indexs[2] = this.faces[i][2][0] - 1;
            var t1 = subtract(this.verticesAndNormals[0][indexs[1]], this.verticesAndNormals[0][indexs[0]]);
            var t2 = subtract(this.verticesAndNormals[0][indexs[2]], this.verticesAndNormals[0][indexs[0]]);
            normal = vec4(cross(t1, t2), 0);
            this.verticesAndNormals[1].push(normal);
            //Repete as normais da face 'i' a todos os vertices desta mesma face
            for(j = 0; j < 3; j++){
                indexV = this.faces[i][j][0] - 1;
                this.vertices.push(this.verticesAndNormals[0][indexV]);   
                this.normals.push(normal);   
            }
        }
    }
    this.shading = 'f';
};

ObjDoc.prototype.loadObjFileSmooth = function(){
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
                    if(facesNormal[i - 1].length === 6)
                        break;
                }
            }
        }
        facesNormal.push(null);
        var oldNormals = this.normals;                  //oldNormals armazena as normais em flat shading as reaproveitando
        this.verticesAndNormals[1] = [];
        this.normals = [];
        this.vertices = [];
        for(i = 0; facesNormal[i] != null; i++){
            var normal = vec4(0, 0, 0, 0);
            for(j = 0; j < facesNormal[i].length; j++)
                //Soma as normais das faces adjacentes ao vertice i, * 3 pois as normais vao de 3 em 3
                normal = add(normal, oldNormals[facesNormal[i][j] * 3]);
            this.verticesAndNormals[1].push(normal);
        }      
        for(i = 0; this.faces[i] != null; i++){
            for(j = 0; j < 3; j++){
                indexV = this.faces[i][j][0] - 1;
                this.vertices.push(this.verticesAndNormals[0][indexV]);
                this.normals.push(this.verticesAndNormals[1][indexV]);   
            }
        }
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

ObjDoc.prototype.maxValue = function(){
    var maxX = 0;
    var maxY = 0;
    var maxZ = 0;
    var max  = 0; 
    var size = this.verticesAndNormals[0].length
    for(var i = 0; i < size; i++){
        var x = Math.abs(this.verticesAndNormals[0][i][0]);
        var y = Math.abs(this.verticesAndNormals[0][i][1]);
        var z = Math.abs(this.verticesAndNormals[0][i][2]);
        if(x > maxX)
            maxX = x;
        if(y > maxY)
            maxY = y;
        if(z > maxZ)
            maxZ = z;
    }
    if(maxX > maxY){
        if(maxX > maxZ)
            max = maxX;
        else
            max = maxZ;
    } else{
        if(maxY > maxZ)
            max = maxY;
        else
            max = maxZ;
    }
    return max;   
}

ObjDoc.prototype.massCenter = function(){
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;
    var size = this.verticesAndNormals[0].length
    for(var i = 0; i < size; i++){
        var x = this.verticesAndNormals[0][i][0];
        var y = this.verticesAndNormals[0][i][1];
        var z = this.verticesAndNormals[0][i][2]; 
        sumX += x;
        sumY += y;
        sumZ += z;
    }
    this.xCenter = sumX/size;
    this.yCenter = sumY/size;
    this.zCenter = sumZ/size;
}
