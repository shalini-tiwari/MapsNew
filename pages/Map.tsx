/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';

interface Location {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = ({}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const API_KEY = 'AIzaSyAzhRiTN1qJNYTj-tnZqu7Lk-IppPkLfag';

  useEffect(() => {
    getLocationAsync();
  }, []);

  const getLocationAsync = async () => {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(currentLocation.coords);
  };

  const sendLocationChangeNotification = (newLocation: any) => {
    console.log(newLocation);
    PushNotification.localNotification({
      channelId: '1',
      title: 'Location Updated',
      message: `New Location: ${newLocation}`,
    });
  };

  const handlePlacePress = async (
    data: any,
    _details: any = null,
  ): Promise<void> => {
    console.log(data);
    try {
      const placeId = data.place_id;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`,
      );
      const {lat, lng} = response.data.result.geometry.location;
      setLocation({
        latitude: lat,
        longitude: lng,
      });

      sendLocationChangeNotification(data.description);
      //   sendLocalNotification();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location ? location.latitude : 0,
            longitude: location ? location.longitude : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
              : undefined
          }>
          {location && (
            <Marker coordinate={location} title="Current Location" />
          )}
        </MapView>
      ) : (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={{textAlign: 'center'}}>Loading...</Text>
        </View>
      )}
      <GooglePlacesAutocomplete
        placeholder="Search for places"
        onPress={handlePlacePress}
        query={{
          key: API_KEY,
          language: 'en',
        }}
        styles={{
          container: {
            padding: '5%',
            position: 'absolute',
            top: 10,
            width: '100%',
          },
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth: 0,
          },
          textInput: {
            borderColor: '#000',
            marginLeft: 0,
            marginRight: 0,
            height: 50,
            color: '#5d5d5d',
            fontSize: 16,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        currentLocation={true}
        currentLocationLabel="Current location"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapScreen;
