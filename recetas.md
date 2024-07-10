---
layout: page
title: Recetas
permalink: /recetas/
---

<style>
  .recipe-list {
    list-style-type: none;
    padding: 0;
  }
  .recipe-list li {
    margin-bottom: 10px;
  }
  .recipe-list li a {
    color: #0366d6; /* Enlace azul similar al de GitHub */
    text-decoration: none;
    font-size: 18px;
    font-weight: bold;
  }
  .recipe-list li a:hover {
    text-decoration: underline;
  }
</style>

<ul class="recipe-list">
  {% for recipe in site.recetas %}
    <li>
      <a href="{{ recipe.url }}">{{ recipe.title }}</a>
    </li>
  {% endfor %}
</ul>

