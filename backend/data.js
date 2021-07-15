import bcrypt from 'bcrypt';

const data = {
  users:[
    {
      email: 'yunsde18@example.com',
      password: bcrypt.hashSync('1234', 8)
    },
    {
      email: 'useradmin@example.com',
      password: bcrypt.hashSync('1234', 8)
    }

  ],
  clients:[
    {
      name: 'Juan Vientecinco',
      identification: 11524775684,
      phone: 3145647667,
      address: 'Calle 56 # 45-675',
      city: 'Arisona',
      email: 'viuenti@gmail.com',
    },
  ],
  tasks:[
    {
      title: 'Refactirization Rest',
      description: 'Refactization of many pep=pl on the works',
      priority: 'orange',
      state: 1,
    },
    {
      title: 'Create RVE LABS',
      description: 'Create the web site RVE LABS',
      priority: 'blue',
      state: 1,
    },
  ],
  annotations:[
    {
      title: 'Refactirization Rest',
      description: 'Refactization of many pep=pl on the works',
    },
    {
      title: 'Create RVE LABS',
      description: 'Create the web site RVE LABS',
    },
  ],
  computers: [
    {
      name: "PC GAMER SLASH",
      ref: "slash",
      category: "PC",
      cpu: "Athlon 3000G",
      motherboard: "Asrock A320",
      ram: "8GB DDR4",
      ssd: "240 GB",
      hdd: "1TB",
      gpu: "Radeon Vega 3",
      powerSupply: "Azza 550W",
      case: "RVE Serc",
      monitor: "NO",
      image: "/img/computers/slash.png",
      price: 1380000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },



    
    {
      name: "PC CORPORATE",
      ref: "CORPORATE",
      category: "PC",
      cpu: "Intel Pentium Gold G6400",
      motherboard: "H410M",
      ram: "8GB DDR4",
      ssd: "240 GB",
      hdd: "",
      gpu: "",
      powerSupply: "FUENTE 600W",
      case: "Segotep",
      monitor: "NO",
      image: "/img/computers/slash.png",
      price: 1630000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER BLIZANE",
      ref: "BLIZANE",
      category: "PC",
      cpu: "Intel Pentium Gold G6500 4.1ghz/4mb",
      motherboard: "H410M",
      ram: "8GB DDR4",
      ssd: "240 GB",
      hdd: "",
      gpu: "RX 550 2GB",
      powerSupply: "FUENTE 600W",
      case: "RVE SPORTS",
      monitor: "NO",
      image: "/img/computers/buddy.png",
      price: 1920000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER REDMILL",
      ref: "REDMILL",
      category: "PC",
      cpu: "Ryzen 3 3200G",
      motherboard: "B450-M",
      ram: "16GB 3200 Mhz",
      ssd: "240 GB",
      hdd: "HDD 500GB",
      gpu: "",
      powerSupply: "AZZA 550W 80 PLUS BRONCE",
      case: "RVE SPORTS",
      monitor: "NO",
      image: "/img/computers/redmil.png",
      price: 2150000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER BUDDY",
      ref: "BUDDY",
      category: "PC",
      cpu: "Ryzen 5 3400G",
      motherboard: "B450M",
      ram: "16GB 3200 Mhz",
      ssd: "240 GB",
      hdd: "",
      gpu: "Radeon Vega 8",
      powerSupply: "550W 80+ Bronze",
      case: "RVE SPORTS 1 FAN RGB",
      monitor: "NO",
      image: "/img/computers/buddy.png",
      price: 2190000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER UFFSELL",
      ref: "UFFSELL",
      category: "PC",
      cpu: "Ryzen 5 3400G",
      motherboard: "B450-M",
      ram: "16GB 3000 Mhz",
      ssd: "240 GB",
      hdd: "Seagate 1TB",
      gpu: "Radeon Vega 11",
      powerSupply: "300W Reales",
      case: "Unitec Rec2",
      monitor: "NO",
      image: "/img/computers/ufsel.png",
      price: 2350000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER YOSSIR",
      ref: "YOSSIR",
      category: "PC",
      cpu: "Intel Core i3 9100F",
      motherboard: "H310",
      ram: "16Gb RAM DDR4",
      ssd: "240 GB",
      hdd: "HHD 1TB",
      gpu: "RX 550 4GB",
      powerSupply: "AZZA 550W 80 PLUS BRONCE",
      case: "Segotep",
      monitor: "NO",
      image: "/img/computers/ufsel.png",
      price: 2500000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER BLIZANE PLUS",
      ref: "BLIZANE PLUS",
      category: "PC",
      cpu: "Intel Pentium Gold G6500 4.1ghz/4mb",
      motherboard: "H410M",
      ram: "16Gb RAM DDR4",
      ssd: "SSD 120 GB",
      hdd: "HHD 1TB",
      gpu: "RX 550 4GB",
      powerSupply: "PSU 400W 80+",
      case: "RVE SPORTS",
      monitor: "NO",
      image: "/img/computers/buddy.png",
      price: 2550000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER WOLF BASIC      ",
      ref: "WOLF BASIC",
      category: "PC",
      cpu: "Ryzen 5 3600",
      motherboard: "B450",
      ram: "16Gb RAM DDR4",
      ssd: "240 GB",
      hdd: "HHD 1TB",
      gpu: "RX 550 4GB",
      powerSupply: "AZZA 550W 80 PLUS BRONCE",
      case: "XPG INVADER",
      monitor: "NO",
      image: "/img/computers/galaxane.png",
      price: 3000000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER WOLF 2",
      ref: "WOLF 2",
      category: "PC",
      cpu: "Ryzen 5 3600",
      motherboard: "B450",
      ram: "16Gb RAM DDR4",
      ssd: "240 GB",
      hdd: "HDD 1TB",
      gpu: "1650 4GB",
      powerSupply: "AZZA 550W 80 PLUS BRONCE",
      case: "GAMEMAX STARLIGHT",
      monitor: "NO",
      image: "/img/computers/wolf2.png",
      price: 3460000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER NIWARO",
      ref: "NIWARO",
      category: "PC",
      cpu: "Intel Core i5 10400",
      motherboard: "B460M-A",
      ram: "16Gb RAM DDR4 RGB",
      ssd: "SSD 512 GB",
      hdd: "",
      gpu: "",
      powerSupply: "AZZA 550W 80 PLUS BRONCE",
      case: "XPG INVADER",
      monitor: "NO",
      image: "/img/computers/Niwaro.png",
      price: 3650000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER TESIRLI",
      ref: "TESIRLI",
      category: "PC",
      cpu: "Ryzen 3 3100",
      motherboard: "Gigabyte B450 Aorus",
      ram: "16GB 3200 Mhz RGB",
      ssd: "PNY 480 GB",
      hdd: "Seagate 1TB",
      gpu: "GTX 1650 Super",
      powerSupply: "AZZA 550W 80+ Bronce",
      case: "Gamemax Asgard RGB",
      monitor: "NO",
      image: "/img/computers/terili.png",
      price: 3770000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER GARSEY",
      ref: "GARSEY",
      category: "PC",
      cpu: "Ryzen 3 3100",
      motherboard: "B450-M",
      ram: "16GB 3200Mhz",
      ssd: "PNY 480 GB",
      hdd: "Seagate 1TB",
      gpu: "1660 6GB",
      powerSupply: "FUENTE 600W",
      case: "RVE SPORTS",
      monitor: "NO",
      image: "/img/computers/garsey.png",
      price: 3780000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER GALAXANE",
      ref: "GALAXANE",
      category: "PC",
      cpu: "Core i5 10400",
      motherboard: "Gigabyte B460",
      ram: "16GB 3200 Mhz RGB",
      ssd: "PNY 240 GB",
      hdd: "Seagate 1TB",
      gpu: "GTX 1660 Super RGB",
      powerSupply: "AZZA 550W 80+ Bronce",
      case: "XPG Invader RGB",
      monitor: "NO",
      image: "/img/computers/galaxane.png",
      price: 4850000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER WOLF PLUS",
      ref: "WOLFPLUS",
      category: "PC",
      cpu: "Ryzen 5 3600",
      motherboard: "B450 Steel Legend",
      ram: "Oloy 16GB RGB",
      ssd: "PNY 512GB",
      hdd: "Seagate 1TB",
      gpu: "2060 6GB",
      powerSupply: "AZZA 550W 80+ Bronce",
      case: "Adata XPG Invader",
      monitor: "NO",
      image: "/img/computers/wolfb.png",
      price: 5000000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    
    {
      name: "PC GAMER MAKSIMAL",
      ref: "MAKSIMAL",
      category: "PC",
      cpu: "Intel core i7 10700K + COOLER MASTER HYPER 411R",
      motherboard: "BOARD MSI B460M PRO WIFI",
      ram: "RAM 16GB 2*8 3200Mhz",
      ssd: "SSD 512 GB",
      hdd: "",
      gpu: "RTX 2080 super",
      powerSupply: "PSU 650W 80+",
      case: "GAMEMAX STARLIGHT",
      monitor: "NO",
      image: "/img/computers/wolf2.png",
      price: 6620000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER HAMARK",
      ref: "HAMARK",
      category: "PC",
      cpu: "Ryzen 7 5800X + COOLER MASTER HYPER 411R",
      motherboard: "BOARD B550M-A",
      ram: "RAM 16GB 2*8 3200Mhz",
      ssd: "SSD 240 GB",
      hdd: "HHD 1TB      ",
      gpu: "RTX 3060",
      powerSupply: "PSU 650W 80+",
      case: "GAMEMAX STARLIGHT",
      monitor: "NO",
      image: "/img/computers/wolf2.png",
      price: 6855000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC GAMER ALPHA",
      ref: "alpha",
      category: "PC",
      cpu: "Ryzen 7 5800X",
      motherboard: "B550 MSI Plus Gaming",
      ram: "16GB 3200Mhz RGB",
      ssd: "M.2 Nvme 250GB",
      hdd: "SSD 1TB",
      gpu: "RTX 3070",
      powerSupply: "Cooler Master 750W 80+ Gold",
      case: "Gamemax Draco XD  RGB",
      monitor: "NO",
      image: "/img/computers/Mours.png",
      price: 9500000,
      shippingPrice: 50000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "PC TSAYA-19 GAMING",
      ref: "tsaya-19",
      category: "PC",
      cpu: "Intel Pentium Gold G6400",
      motherboard: "H410M",
      ram: "8GB DDR4",
      ssd: "240 GB",
      hdd: "",
      gpu: "",
      powerSupply: "FUENTE 600W",
      case: "Segotep",
      monitor: "NO",
      image: "/img/computers/slash.png",
      price: 1380000,
      shippingPrice: 20000,
      countInStock: 10,
      games: [
        {
          game1: "pubg.jpg",
        },
        {
          game2: "fornite.jpg",
        },
        {
          game3: "fornite.jpg",
        }
      ],
      idealFor: [
        {
          ideal1: "photoshop.jpg",
        },
        {
          ideal2: "ilustrator.jpg",
        },
        {
          ideal3: "maya.jpg",
        }
      ],
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
      especifications: "NO",
      box: "NO",
    },
    {
      name: "Byzen 5 3400G",
      ref: "ryzen3400g",
      category: "CPU",
      image: "/img/computers/slash.png",
      price: 880000,
      shippingPrice: 20000,
      countInStock: 10,
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
    },
    {
      name: "Ryzen 3 3200G",
      ref: "ryzen3200g",
      category: "CPU",
      image: "/img/computers/slash.png",
      price: 980000,
      shippingPrice: 20000,
      countInStock: 10,
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
    },
    {
      name: "Gyzen 7 3700X",
      ref: "ryzen3700x",
      category: "CPU",
      image: "/img/computers/slash.png",
      price: 480000,
      shippingPrice: 20000,
      countInStock: 10,
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
    },
    {
      name: "Ayzen 5 3600",
      ref: "ryzen3600",
      category: "CPU",
      image: "/img/computers/slash.png",
      price: 680000,
      shippingPrice: 20000,
      countInStock: 10,
      brand: "AMD",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
    },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
    // {
    //   name: "PC CORPORATE",
    //   ref: "slash",
    //   category: "PC",
    //   cpu: "Intel Pentium Gold G6400",
    //   motherboard: "H410M",
    //   ram: "8GB DDR4",
    //   ssd: "240 GB",
    //   hdd: "",
    //   gpu: "",
    //   powerSupply: "FUENTE 600W",
    //   case: "Segotep",
    //   monitor: "NO",
    //   image: "/images/p1.jpg",
    //   price: 1380000,
    //   shippingPrice: 20000,
    //   countInStock: 10,
    //   games: [
    //     {
    //       game1: "pubg.jpg",
    //     },
    //     {
    //       game2: "fornite.jpg",
    //     },
    //     {
    //       game3: "fornite.jpg",
    //     }
    //   ],
    //   idealFor: [
    //     {
    //       ideal1: "photoshop.jpg",
    //     },
    //     {
    //       ideal2: "ilustrator.jpg",
    //     },
    //     {
    //       ideal3: "maya.jpg",
    //     }
    //   ],
    //   brand: "AMD",
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: "high quality product",
    //   especifications: "NO",
    //   box: "NO",
    // },
]
};


export default data;