import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { Camera, useCameraDevices, CameraPermissionStatus } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

const App = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  
  // Fetch available camera devices
  const devices = useCameraDevices();
  
  // Select the first available back camera or fallback to null if no device
  const device = devices.find((d) => d.position === 'back');

  const cameraRef = useRef<Camera>(null);

  // Request camera permission on app load
  useEffect(() => {
    const requestPermission = async () => {
      const permissionResult: CameraPermissionStatus = await Camera.requestCameraPermission();
      if (permissionResult === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert('Permission Denied', 'Camera permission is required for this app to work.');
      }
    };
    requestPermission();
  }, []);

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        // Capture photo
        const photo = await cameraRef.current.takePhoto({
          flash: 'off', // Optional: Change flash mode here
        });

        // Save the captured photo to the device storage
        const photoPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}.jpg`;
        await RNFS.moveFile(photo.path, photoPath);
        
        // Set the photo URI to display it
        setPhotoUri(photoPath);
        Alert.alert('Photo Saved', `Photo saved at ${photoPath}`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'An error occurred while capturing the photo.');
    }
  };

  if (!device || !hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noCamera}>
          <Button title="Camera permission required" onPress={() => {}} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true} // Enable photo mode
      />
      <View style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={takePhoto} />
      </View>

      {photoUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: `file://${photoUri}` }} style={styles.photo} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  noCamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});

export default App;
