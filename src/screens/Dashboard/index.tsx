import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Custom components
import RecipeCard from '../../components/Recipe/RecipeCard';
import EmptyState from '../../components/UI/EmptyState';
import SearchBar from '../../components/UI/SearchBar';

// Store and models
import { useRecipeStore } from '../../store/recipeStore';
import { Recipe } from '../../data/models/RecipeModels';

// Theming
import { colors, spacing, shadows } from '../../utils/theme';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Zustand store
  const {
    recipes,
    isLoading,
    pagination,
    searchTerm,
    error,
    fetchRecipes,
    searchRecipes,
    resetSearch,
    refreshRecipes
  } = useRecipeStore();

  // Local state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recipes when component mounts
  useEffect(() => {
    fetchRecipes(0);
  }, [fetchRecipes]);

  // Handle search
  const handleSearch = (term: string) => {
    if (term.trim()) {
      searchRecipes(term);
    } else {
      resetSearch();
    }
  };

  // Handle recipe press
  const handleRecipePress = (recipe: Recipe) => {
    // Navigate to recipe details screen when implemented
    navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  };

  // Handle add recipe
  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  // Handle refresh (pull to refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshRecipes();
    setRefreshing(false);
  }, [refreshRecipes]);

  // Handle pagination (infinite scroll)
  const handleLoadMore = () => {
    if (!isLoading && pagination.hasMore) {
      const nextPage = Math.floor(pagination.offset / pagination.limit) + 1;
      fetchRecipes(nextPage);
    }
  };

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!isLoading || recipes.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Render empty component
  const renderEmpty = () => {
    if (isLoading && recipes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <EmptyState
        icon="restaurant-outline"
        title={searchTerm ? "No matching recipes" : "No recipes yet"}
        message={
          searchTerm
            ? "Try searching with different keywords"
            : "Add your first recipe by tapping the + button"
        }
        actionText={searchTerm ? "Clear Search" : undefined}
        onAction={searchTerm ? resetSearch : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <SearchBar
        value={searchTerm}
        onChangeText={(text) => searchRecipes(text)}
        onSearch={handleSearch}
        onClear={resetSearch}
      />

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id?.toString() || ''}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={handleRecipePress} />
        )}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={renderFooter()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={recipes.length === 0 ? styles.emptyList : null}
      />

      {/* Floating Action Button for adding recipes */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddRecipe}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  footerLoader: {
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 8,
    ...shadows.large,
  }
});

export default DashboardScreen;