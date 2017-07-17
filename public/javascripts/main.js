//CREAMOS VARIABLES GLOBALES
var MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
MAPAPP.airports = 'airports';
var point1 = [37.7125689, -122.2219315, 'Aeropuerto Internacional de Oakland', false]; 
var point2 = [37.6213129, -122.3811441, 'Aeropuerto Internacional de San francisco',false];
var message = document.getElementById('message');

//INICIAMOS LAS FUNCIONES AL CARGAR LA PAGINA
$(document).ready(function() {
    initialize();
    populateMarkers(MAPAPP.airports);
    getDistance();
});

//INICIAMOS GOOGLE MAPS
function initialize() {
    var center = new google.maps.LatLng(38.4079479,-97.0975106);
    var mapOptions = {
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center,
    };

    this.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
};

// POBLAMOS EL MAPA CON LOS MARCADORES
function populateMarkers(dataType) {
    apiLoc = typeof apiLoc !== 'undefined' ? apiLoc : '/data/' + dataType + '.json';
    // ATRAVES DE JQUERY ATRAEMOS NUESTRO ARCHIVO JSON
    $.getJSON(apiLoc, function(data) {
        //CON LOS DATOS ADQUIRIDOS DE NUESTRO JSON NOS PONDRA UN MARCADOR POR ITEM
        $.each(data, function(i, ob) {
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(this.location.coordinates[0], this.location.coordinates[1]),
                name: this.name,
                description: this.description,
                website: this.website,
                icon: './images/marker-icon.png'
            });
    	//CREAMOS NUESTRO CONTENIDO PARA NUESTRA VENTANA DE INFORMACION
            var content = '<h1 class="mt0"><a href="' + marker.website + '" target="_blank" title="' + marker.name + '">' + marker.name + '</a></h1><p>' + marker.description + '</p>';
        	marker.infowindow = new google.maps.InfoWindow({
            	content: content,
            	maxWidth: 400
            });
    	//AÑADIMOS LA VENTANA DE INFORMACION
            google.maps.event.addListener(marker, 'click', function() {
                if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
                // ABRIMOS EL POPUP AL DAR CLICL SOBRE CUALQUIER MARCADOR
                marker.infowindow.open(map, marker);
                MAPAPP.currentInfoWindow = marker.infowindow;
                if(!point1[3]){
                /// OBTENEMOS LA LATITUD Y LA LONGITUD DEL MARCADOR CLICKEADO Y LO TOMAMOS COMO PRIMER PUNTO DE REFERENCIA
                    point1[0]= this.getPosition().lat();
                    point1[1]= this.getPosition().lng();
                    point1[2]= this.name;
                ///ASIGNAMOS UN VALOR BOLEANOS VERDADERO HACIENDO REFERENCIA A QUE HEMOS ELEGIDO NUESTRO PRIMER PUNTO DE REFERENCIA    
                    point1[3]= true;
                    point2[3]= false;
                }else{
                    //OBTENEMOS LA LATITUD Y LA LONGITUD DEL MARCADOR CLICKEADO Y LO TOMAMOS COMO SEGUNDO PUTNO DE REFERENCIA
                    point2[0]= this.getPosition().lat();
                    point2[1]= this.getPosition().lng();
                    point2[2]= this.name;
                    point2[3]= true;
                    ///ASIGNAMOS UN VALOR BOLEANOS FALSO PARA DECIR QUE TENEMOS LOS DOS PUTNOS DE REFERENCIA Y QUE CALCULEMOS LA DISTANCIA
                    point1[3]= false;
                    ///EJECUTAMOS LA FUNCION PARA MEDIR LA DISTACIA 
                    getDistance();
                }
            });
            MAPAPP.markers.push(marker);
        });
    });
};

function getKilometros(lat1,lon1,lat2,lon2){
        /// CON ESTA FUNCION OBTENDREMOS LA DISTACIA EN KILOMETROS DADOS DOS PUNTOS DE REFENCIA
        var R = 6378.137; //RADIO DE LA TIERRA EN KM
        var dLat = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
    return d.toFixed(3); //RETORNA EL RESULTADO CON 3 DECIMALES
}
function rad(x) {
    return x*Math.PI/180;
}

function getDistance(){
    var flightPlanCoordinates = [
        {lat: point1[0], lng: point1[1]},
        {lat: point2[0], lng: point2[1]}
      ];
      
      // EDITAMOS LAS CARACTERISTICAS DE LA LINEA A DIBUJAR SOBRE EL MAPA
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#EC4D00',
        strokeOpacity: 3.0,
        strokeWeight: 2
      });
      
      // DIBUJAMOS LA LINEA DE REFERENCIA SOBRE LOS PUNTOS ELEGIDO SOBRE EL MAPA
      flightPath.setMap(map);
      //TOMAMOS EL VALOR DE LA DISTANCIA EN KM
      var distanceKm = getKilometros(point1[0], point1[1], point2[0], point2[1]);
      /// TRANSFORMAMOS LOS KM EN MILLAS NAUTICAS
      var distanceMN = distanceKm * 0.539957;
      /// MOSTRAMOS EL RESULTADO EN LA PAGINA
      $('#message').html('LA DISTANCIA EN MILLAS NAUTICAS ENTRE EL "'+ point1[2] +'" Y "'+point2[2]+ '" ES :'+distanceMN);

        /// CREMOS UNA VENTANA DE INFORMACION PARA GUARDAR EL RESULTADO OBTENIDO
        flightPath.infowindow = new google.maps.InfoWindow({
            	content: 'LA DISTANCIA EN MILLAS NAUTICAS ENTRE EL "'+ point1[2] +'" Y "'+point2[2]+ '" ES :'+ distanceMN,
            	maxWidth: 400
        });
       
       google.maps.event.addListener(flightPath, 'click', function() {
            ///AL DAR CLICK SOBRE LA LINEA ELEGIDA NOS DEVOLVERA LOS PUNTOS DE REFERENCIA Y LA DISTACIA EN MILLAS NAUTICAS
            $('#message').html(flightPath.infowindow.getContent());
        });
}