import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { SLIDES, SLIDER_SETTINGS } from "../models/sliderData";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slide = React.memo(({ slide }) => (
  <div className="slide">
    <div className="slide-content">
      <div className="slide-text">
        <h2>{slide.title}</h2>
        <h3>{slide.subtitle}</h3>
        <ul>
          {slide.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      <div className="slide-image">
        <img src={slide.image} alt={slide.title} loading="lazy" />
      </div>
      <Link to={slide.link} className="slide-button">
        {slide.buttonText}
      </Link>
    </div>
  </div>
));

Slide.displayName = "Slide";

const HeroSlider = () => (
  <div className="carousel-section">
    <Slider {...SLIDER_SETTINGS}>
      {SLIDES.map((slide, index) => (
        <Slide key={index} slide={slide} />
      ))}
    </Slider>
  </div>
);

export default HeroSlider;
