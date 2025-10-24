import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ImportRecipeScreen } from './index';

type AddRecipeStackParamList = {
  Manual: undefined;
  Import: undefined;
};

const Stack = createNativeStackNavigator<AddRecipeStackParamList>();

// Main AddRecipe Navigator component
const AddRecipeScreen: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Manual"
        component={ManualAddRecipeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Import"
        component={ImportRecipeScreen}
        options={{
          title: 'Import Recipe from URL',
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

// Manual recipe entry screen
const ManualAddRecipeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Recipe</Text>
        </View>

        <View style={styles.importContainer}>
          <Text style={styles.importText}>Have a recipe URL?</Text>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => navigation.navigate('Import')}
          >
            <Text style={styles.importButtonText}>Import from URL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Recipe Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter recipe name"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter recipe description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Preparation Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="Prep time"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Cooking Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="Cooking time"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Save Recipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddRecipeScreen;