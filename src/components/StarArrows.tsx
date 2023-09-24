import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

const StarArrows = ({ className = "" }: { className?: string }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    rotationAngle: 0,
  });
  const inset = 10;
  const cornerInset = inset + 5;

  useEffect(() => {
    const updateDimensions = () => {
      const { clientWidth, clientHeight } = document.documentElement;
      const aspectRatio = clientWidth / clientHeight;
      const rotationAngle = Math.atan(aspectRatio) * (180 / Math.PI);
      setDimensions({
        width: clientWidth,
        height: clientHeight,
        rotationAngle,
      });

      if (svgRef.current) {
        svgRef.current.setAttribute(
          "viewBox",
          `0 0 ${clientWidth} ${clientHeight}`
        );
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <svg ref={svgRef} width="100%" height="100%">
      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={dimensions.width / 2}
        y2={inset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* top center arrow */}
      <polygon
        points={`${dimensions.width / 2},${inset} ${
          dimensions.width / 2 - 7.5
        },${inset + 10} ${dimensions.width / 2 + 7.5},${inset + 10}`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={dimensions.width - inset}
        y2={dimensions.height / 2}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* right center arrow */}
      <polygon
        points={`${dimensions.width - inset},${dimensions.height / 2} ${
          dimensions.width - inset - 10
        },${dimensions.height / 2 - 7.5} ${dimensions.width - inset - 10},${
          dimensions.height / 2 + 7.5
        }`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={dimensions.width / 2}
        y2={dimensions.height - inset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* bottom center arrow */}
      <polygon
        points={`${dimensions.width / 2},${dimensions.height - inset} ${
          dimensions.width / 2 - 7.5
        },${dimensions.height - inset - 10} ${dimensions.width / 2 + 7.5},${
          dimensions.height - inset - 10
        }`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={inset}
        y2={dimensions.height / 2}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* left center arrow */}
      <polygon
        points={`${inset},${dimensions.height / 2} ${inset + 10},${
          dimensions.height / 2 + 7.5
        } ${inset + 10},${dimensions.height / 2 - 7.5}`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={cornerInset}
        y2={cornerInset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* top left arrow */}
      <polygon
        points={`${cornerInset},${cornerInset} ${cornerInset},${
          cornerInset + 10
        } ${cornerInset + 10},${cornerInset}`}
        transform={`rotate(${
          45 - dimensions.rotationAngle
        }, ${cornerInset}, ${cornerInset})`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={dimensions.width - cornerInset}
        y2={cornerInset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* top right arrow */}
      <polygon
        points={`${dimensions.width - cornerInset},${cornerInset} ${
          dimensions.width - cornerInset - 10
        },${cornerInset} ${dimensions.width - cornerInset},${cornerInset + 10}`}
        transform={`rotate(${dimensions.rotationAngle - 45}, ${
          dimensions.width - cornerInset
        }, ${cornerInset})`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={cornerInset}
        y2={dimensions.height - cornerInset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
      {/* bottom left arrow */}
      <polygon
        points={`${cornerInset},${
          dimensions.height - cornerInset
        } ${cornerInset},${dimensions.height - cornerInset - 10} ${
          cornerInset + 10
        },${dimensions.height - cornerInset}`}
        transform={`rotate(${dimensions.rotationAngle - 45}, ${cornerInset}, ${
          dimensions.height - cornerInset
        })`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      <line
        x1={dimensions.width / 2}
        y1={dimensions.height / 2}
        x2={dimensions.width - cornerInset}
        y2={dimensions.height - cornerInset}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />

      {/* bottom right arrow */}
      <polygon
        points={`${dimensions.width - cornerInset},${
          dimensions.height - cornerInset
        } ${dimensions.width - cornerInset},${
          dimensions.height - cornerInset - 10
        } ${dimensions.width - cornerInset - 10},${
          dimensions.height - cornerInset
        }`}
        transform={`rotate(${45 - dimensions.rotationAngle}, ${
          dimensions.width - cornerInset
        }, ${dimensions.height - cornerInset})`}
        style={{ fill: "hsl(266 10% 80%)", stroke: "hsl(266 10% 80%)" }}
      />
    </svg>
  );
};

export default StarArrows;
