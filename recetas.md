---
layout: page
title: Recetas
permalink: /recetas/
---

<ul>
  {% for recipe in site.recetas %}
    <li>
      <a href="{{ recipe.url }}">{{ recipe.title }}</a>
    </li>
  {% endfor %}
</ul>

