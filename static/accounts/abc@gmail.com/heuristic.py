
class Heuristic:
  """
  cur_weight,
  edge_weight,
  end_pos,
  cur_pos,
  h_func,
  """
  @staticmethod
  def djikstra_heuristic(params:dict):
    return params['cur_weight']+params['edge_weight']
  
  @staticmethod
  def greedy_heuristic(params:dict):
    return params['edge_weight']

  @staticmethod
  def a_star_heuristic(params:dict):
    return  (params['cur_weight']+params['edge_weight']) \
            +                                     \
            (params['h_func'](params['cur_pos'],params['end_pos']))
