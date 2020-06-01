import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {exhaustMap, map, take, tap} from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import {AuthService} from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  private static readonly REPO = 'https://udang-recipe-book.firebaseio.com/recipes.json';

  constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        DataStorageService.REPO,
        recipes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRecipes() {
    return this.authService.user.pipe(
      take(1),  // unsubscribe after one access
      exhaustMap(user => {
        return this.http
          .get<Recipe[]>(
            DataStorageService.REPO,
            {
              params: new HttpParams().set('auth', user.token)
            }
          );
        }),
      map(recipes => {
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      tap(recipes => {
        this.recipeService.setRecipes(recipes);
      }));
  }
}
