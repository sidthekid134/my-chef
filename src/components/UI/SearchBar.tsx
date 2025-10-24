import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../utils/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search recipes...',
  value,
  onChangeText,
  onSearch,
  onClear,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value) {
        onSearch(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  // Clear search handler
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.searchContainer,
          isFocused ? styles.searchContainerFocused : null,
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(value)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value !== '' && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
});

export default SearchBar;