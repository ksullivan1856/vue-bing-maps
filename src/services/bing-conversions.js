export default {
    toMapLocation: function(location){
        if(!location){
            return null;
        }

        return new Microsoft.Maps.Location(location.latitude, location.longitude);
    },
    toMapPoint: function(point){
        if(!point){
            return null;
        }

        return new Microsoft.Maps.Point(point.x, point.y);
    },
    toMapTypeId: function(source){
        if(!source){
            return null;
        }

        if(Array.isArray(source)){
            return source.map(function(item){
                return Microsoft.Maps.MapTypeId[item];
            });
        }

        return Microsoft.Maps.MapTypeId[source];
    },
    toNavigationBarOrientation: function(source){
        if(!source){
            return null;
        }

        return Microsoft.Maps.NavigationBarOrientation[source];
    }
}