import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../data/models/RecipeModels';
import { colors, shadows, spacing, typography } from '../../utils/theme';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  // Calculate total time
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  // Placeholder image if no imageUrl provided
  const placeholderImage = 'https://via.placeholder.com/300x200/DDDDDD/999999?text=Recipe';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(recipe)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: recipe.imageUrl || placeholderImage }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{totalTime} min</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    ...shadows.medium,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold as any,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.small,
    color: colors.textSecondary,
  },
});

export default RecipeCard;