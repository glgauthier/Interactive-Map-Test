function dictionary(original){
    switch (original){
        case 'Numero':              return "Island Number";
        case 'Nome_Isola':          return "Island Name";
        case 'Superficie':          return "Area";
        case 'sum_pop_11':          return "Population Total";
        case 'pop_den_11':          return "Population Density";
        default:                    return original;
    }
}