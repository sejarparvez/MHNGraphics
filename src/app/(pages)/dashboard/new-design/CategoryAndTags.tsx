import { X } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { designCategories } from '@/constant/DesignCategory';
import type { NewDesignSchemaType } from '@/lib/Schemas';

export const CategoryAndTags: React.FC = () => {
  const { control, setValue, watch } = useFormContext<NewDesignSchemaType>();
  const tags = watch('tags') || [];

  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim(); // Trim whitespace from the input
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const currentTags = watch('tags') || [];
      setValue('tags', [...currentTags, trimmedTag]); // Set the new tags array directly
      setInput(''); // Clear the input field after adding the tag
    } else if (!trimmedTag) {
      return null;
    }
  };

  const removeTag = (indexToRemove: number) => {
    setValue(
      'tags',
      tags.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category and Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6'>
          <div className='grid gap-4'>
            <FormField
              control={control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <Label>Design Category</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {designCategories.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value
                            .toLowerCase()
                            .replace(/\s+/g, '_')}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormLabel>Tags</FormLabel>
            <div className='mb-2 flex flex-wrap gap-2'>
              {tags
                .filter((tag) => tag.trim() !== '') // Filter out empty string tags
                .map((tag: string, index: number) => (
                  <Badge
                    // biome-ignore lint: error
                    key={index}
                    variant='secondary'
                    className='px-2 py-1 text-sm'
                  >
                    {tag}
                    <Button
                      variant='ghost'
                      size='sm'
                      type='button'
                      className='ml-1 h-auto p-0'
                      onClick={() => removeTag(index)}
                    >
                      <X className='h-3 w-3' />
                      <span className='sr-only'>Remove {tag} tag</span>
                    </Button>
                  </Badge>
                ))}
            </div>

            <div className='flex gap-2'>
              <Input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Add a tag...'
                className='grow'
              />
              <Button
                variant='outline'
                type='button'
                onClick={() => addTag(input)}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
