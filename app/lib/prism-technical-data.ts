export type PrismTechnicalData = {
  certification?: string
  valveInsert?: string
  seat?: string
  leakageRateInternal?: string
  leakageRateExternal?: string
  workingTemp?: string
  connections?: string
  code16Equivalent?: string
}

const TECHNICAL_DATA_BY_NEW_CODE: Record<string, PrismTechnicalData> = {
  "PR023SA-420/010/AADF-XNAS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XNAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XFAS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XFAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XNAS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XNAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XFAS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XFAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XNOS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XNOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XFOS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/AADF-XFOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XNOS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XNOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XFOS-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR023SA-420/010/DAHS-XFOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/4\"",
    "code16Equivalent": "D475"
  },
  "PR020SI-420/040/ABAH-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XFAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XFAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XFAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XNOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XNOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XNOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/ABAH-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/AHCA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR020SI-420/040/BAGA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1/2\"",
    "code16Equivalent": "D979"
  },
  "PR038SL-420/040/ABAH-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/AHCA-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/BAGA-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/ABAH-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/AHCA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/BAGA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/ABAH-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/AHCA-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/BAGA-XFOR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/ABAH-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/AHCA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR038SL-420/040/BAGA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "3/8\"",
    "code16Equivalent": "D249"
  },
  "PR026SI-800/040/BAFA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/CAPA-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/BAFA-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/CAPA-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/BAFA-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/CAPA-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/BAFA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-800/040/CAPA-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PEEK",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/BAFA-XNAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/CAPA-XNAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/BAFA-XFAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/CAPA-XFAF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/BAFA-XNOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/CAPA-XNOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/BAFA-XFOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR026SI-X00/015/CAPA-XFOF-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "Stainless Steel",
    "seat": "TORLON",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "9/16-16 UNF C & 3/8\" T",
    "code16Equivalent": "D973"
  },
  "PR065DI-X00/040/CAUA-XPAP-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-40 to +85°C",
    "connections": "13/16\" C&T",
    "code16Equivalent": "D484"
  },
  "PR065DI-X00/040/CAUA-XPOP-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "VESPEL",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-40 to +85°C",
    "connections": "13/16\" C&T",
    "code16Equivalent": "D484"
  },
  "PR052DL-015/120/AAAC-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-015/120/AAAC-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052SL-100/120/ABAK-XNAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D178"
  },
  "PR052SL-100/120/ABAK-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D178"
  },
  "PR052DL-015/090/AAAC-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-015/090/AAAC-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/120/ACCA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/120/ACCA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/090/ACCA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/090/ACCA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-015/120/AAAC-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-015/120/AAAC-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052SL-100/120/ABAK-XFAR-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D178"
  },
  "PR052SL-100/120/ABAK-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D178"
  },
  "PR052DL-015/090/AAAC-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-015/090/AAAC-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/120/ACCA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/120/ACCA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/090/ACCA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR052DL-100/090/ACCA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Brass",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D166"
  },
  "PR077DI-400/100/ACEK-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DI-400/100/ACEK-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DI-400/100/ACEK-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DI-400/100/ACEK-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DL-350/100/ACEK-XNA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DL-350/100/ACEK-XFA0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DL-350/100/ACEK-XNO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR077DL-350/100/ACEK-XFO0-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "1\"",
    "code16Equivalent": "D162"
  },
  "PR279DL-250/150/ACEA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/150/ACEA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/250/ACEA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/250/ACEA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DI-400/120/ACEA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "2\"",
    "code16Equivalent": "D260"
  },
  "PR279DI-400/300/ACEA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "2\"",
    "code16Equivalent": "D260"
  },
  "PR100DL-100/150/AACA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/150/AACA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/250/AACA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/250/AACA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR279DL-250/150/ACEA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/150/ACEA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/250/ACEA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DL-250/250/ACEA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "1 1/2\"",
    "code16Equivalent": "D260"
  },
  "PR279DI-400/120/ACEA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "2\"",
    "code16Equivalent": "D260"
  },
  "PR279DI-400/300/ACEA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "PCTFE",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "2\"",
    "code16Equivalent": "D260"
  },
  "PR100DL-100/150/AACA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/150/AACA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/250/AACA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR100DL-100/250/AACA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +80°C",
    "connections": "2\"",
    "code16Equivalent": "D291"
  },
  "PR475DA-100/350/ACCA-XNAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "3\"",
    "code16Equivalent": "D290"
  },
  "PR475DA-100/350/ACCA-XNOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "NBR",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "3\"",
    "code16Equivalent": "D290"
  },
  "PR475DA-100/350/ACCA-XFAV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "3\"",
    "code16Equivalent": "D290"
  },
  "PR475DA-100/350/ACCA-XFOV-00": {
    "certification": "PED + ATEX certified",
    "valveInsert": "FKM",
    "seat": "Stainless Steel",
    "leakageRateInternal": "10-3 mbar.l/s",
    "leakageRateExternal": "10-4 mbar.l/s",
    "workingTemp": "-20 to +50°C",
    "connections": "3\"",
    "code16Equivalent": "D290"
  }
}

function clean(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

export function getTechnicalDataByNewCode(newCode: unknown): PrismTechnicalData {
  const code = clean(newCode)
  if (!code) return {}
  return TECHNICAL_DATA_BY_NEW_CODE[code] || {}
}

export function pickTechnicalValue(...values: unknown[]) {
  for (const value of values) {
    const cleaned = clean(value)
    if (cleaned && cleaned !== "-" && cleaned.toLowerCase() !== "null" && cleaned.toLowerCase() !== "undefined") {
      return cleaned
    }
  }
  return ""
}
