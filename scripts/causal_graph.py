import cdt
import dowhy
import pydot
import graphviz
import base64

import numpy as np
import pandas as pd
import networkx as nx
import dowhy.gcm as gcm
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from dowhy import gcm
from dowhy import CausalModel
from dowhy.utils import plot
from matplotlib.font_manager import FontProperties
from mpl_toolkits.axes_grid1 import make_axes_locatable
from io import BytesIO
import plotly.graph_objects as go

def causal_analysis(data, treatment_vars, common_causes, target_var, causal_target, estimate_method, refute_method):
    """
    Run causal_analysis function with the imputs specified.
    Args:
        data (dataframe): Can either be the selected batch or entire dataset.
        treatment_vars (list): Single or Multiselection from the variable set
        common_causes (list): Single or Multiselection from the variable set
        target_var (list): Single or Multiselection from CQA set
        causal_target (String): Single selection from either treatment_vars or tar_var set. Cannot be from common_causes_vars set
    
    Returns:
        strength (dict):  dictionary where the keys are tuples containing pairs of strings (source-causal_target), and the values are floating-point numbers (strength).
        refute (string): refute method name
        estimated_effect (String): estmated value from the causal analysis
        new_effect (String): estmated new effect value after testing for robustness
        p_value (String): estimated p-value
    """

    treatment_to_target_edges = [(treatment, target) for treatment in treatment_vars for target in target_var]
    # Create edges between each covariate and treatment_var
    common_cause_to_treatment_edges = [(common_cause, treatment) for treatment in treatment_vars for common_cause in common_causes]
    # Create edges between each covariate and each node in target_var
    common_cause_to_target_edges = [(common_cause, target) for target in target_var for common_cause in common_causes]
    # Combine all sets of edges
    result = (
        treatment_to_target_edges +
        common_cause_to_treatment_edges +
        common_cause_to_target_edges
    )
    causal_graph = nx.DiGraph(result)
    
    # Create a causal model
    model = CausalModel(
        data=data,
        treatment=treatment_vars,
        outcome=target_var,
        common_causes=common_causes
    )
        
    # Identify the causal effect
    identified_estimand = model.identify_effect()
    
    # Estimate the causal effect
    estimate = model.estimate_effect(identified_estimand, method_name=estimate_method)
        
    causal_model = gcm.StructuralCausalModel(causal_graph)
    gcm.auto.assign_causal_mechanisms(causal_model, data)
    gcmmodel = gcm.fit(causal_model, data)
    # Compute the causal strength
    strength = gcm.arrow_strength(causal_model, causal_target)
        
    # Refute the estimate
    refute_results = model.refute_estimate(identified_estimand, estimate, method_name=refute_method)
    refute_results = refute_results.__str__()
    
    entities = refute_results.split('\n')
    # refute = entities[0]
    # estimated_effect = entities[1]
    # new_effect = entities[2]
    # p_value = entities[3]
    
    return strength, entities

def plot_causal_strength(strength_data, causal_target):
    """
    Run plot_causal_strength function for plotting the causal strength graph.
    Args:
        strength_data (dict): dictionary where the keys are tuples containing pairs of strings (source-causal_target), and the values are floating-point numbers (strength).
        causal_target (String): Single selection from either treatment_vars or tar_var set. Cannot be from common_causes_vars set
    
    Returns:
        causal_html (html):  Causal strength plot in html format.
    """
    # Round values to 4 decimal places
    data_rounded = {edge: round(value, 4) for edge, value in strength_data.items()}

    fig = plt.figure(figsize=(12, 10))
    # Create a directed graph
    G = nx.DiGraph()

    # Add nodes and edges to the graph
    for edge, weight in data_rounded.items():
        G.add_edge(edge[0], edge[1], weight=weight)

    # Circular layout
    pos = nx.circular_layout(G)

    # Extract edge weights for coloring
    edge_weights = [data_rounded[edge] for edge in G.edges]

    # Reverse the colormap
    cmap = plt.cm.RdYlGn_r  # Reversed colormap
    norm = plt.Normalize(min(edge_weights), max(edge_weights))

    # Draw the graph
    edges = G.edges()
    colors = [cmap(norm(G[u][v]['weight'])) for u, v in edges]

    # Assign node numbers
    node_numbers = {node: i for i, node in enumerate(G.nodes)}

    # Draw nodes with numbers
    nx.draw_networkx_nodes(G, pos, nodelist=node_numbers.keys(), node_size=900, alpha=0.8, node_color='blue')
    nx.draw_networkx_labels(G, pos, labels={node: str(i) for node, i in node_numbers.items()}, font_size=14, font_color='white', font_family='sans-serif')
    nx.draw_networkx_nodes(G, pos, nodelist=[causal_target], node_size=900, alpha=0.8, node_color='black')

    # Find the edge with the maximum weight
    max_edge = max(data_rounded, key=data_rounded.get)
    
    # Draw edges with colors and labels
    nx.draw_networkx_edges(G, pos, edgelist=edges, edge_color=colors, width=3, arrows=True)
    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
    
    # Add an annotated pointer on the edge with the largest weight
    max_edge_weight = data_rounded[max_edge]
    nx.draw_networkx_edge_labels(G, pos, edge_labels={(max_edge[0], max_edge[1]): f'{max_edge_weight}'}, font_color='red', font_size=12, bbox=dict(facecolor='white', edgecolor='black', boxstyle='round, pad=0.2'))

    # Add colorbar
    sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    cbar = plt.colorbar(sm, orientation='horizontal', label='Edge Strength', fraction=0.15)

    # Adjust the position of the colorbar
    cbar.ax.set_position([0.21, 0.3, 0.6, 0.04])  # Adjust these values to suit your needs

    # Create a legend for node labels without patch box and color with bold numbers
    legend_labels = [f"{i}: {node}" for node, i in node_numbers.items()]
    legend_patches = [mpatches.Patch(color='none', label=label) for label in legend_labels]

    # Make the numbers in the legend bold
    legend_font = FontProperties()
    legend_font.set_weight('bold')

    # Add a bounding box around the legend
    plt.legend(handles=legend_patches, title="Node Legend", loc='upper left', bbox_to_anchor=(1, 1), handlelength=0, handleheight=0, prop=legend_font, borderaxespad=0.5, frameon=True, edgecolor='black')

    # Save the figure as an HTML file with adjusted bbox_inches
    plt.title("Causal Strength")

    tmpfile = BytesIO()
    plt.savefig(tmpfile, format='png', bbox_inches='tight')  # Save as a temporary image file
    encoded = base64.b64encode(tmpfile.getvalue()).decode('utf-8')

    # causal_html = '<html>' + '<img src=\'data:image/png;base64,{}\'>'.format(encoded) + '</html>'
    causal_html = '<img src=\'data:image/png;base64,{}\'>'.format(encoded)
    return causal_html


# UPDATED CAUSAL FUNCTION
def causal_strengthPlot(strength, causal_target):
    # Create a Graph object
    G = nx.DiGraph()  # Use a directed graph for directional edges

    # Add nodes and edges to the graph
    nodes = set()
    for edge in strength:
        nodes.add(edge[0])
        nodes.add(edge[1])
    G.add_nodes_from(nodes)

    # Create a color map for nodes
    colors = [weight for weight in strength.values()]

    # Create a color map for nodes, excluding the target node
    node_colors = {
        node: 'black' if node == causal_target else strength.get((node, causal_target), 0)
        for node in G.nodes()
    }

    for edge, weight in strength.items():
        G.add_edge(edge[0], edge[1], weight=weight)

    # Define the positions of the nodes (circular layout)
#     pos = nx.circular_layout(G)
    pos = nx.circular_layout(G)

    # Increase the size of nodes and edges
    node_size = 20
    edge_width = 2

    # Create the edge traces with directional arrows and labels
    edge_trace = go.Scatter(
        x=[],
        y=[],
        line=dict(width=edge_width, color='gray'),
        hoverinfo='none',
        mode='lines+text',  # Add text labels to the edges
        text=[],  # Initialize an empty list for edge labels
        textposition='middle right',  # Set the position of edge labels
    )

    edge_labels = []  # Initialize a list for edge labels

    for edge in G.edges(data=True):
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_trace['x'] += (x0, x1, None)
        edge_trace['y'] += (y0, y1, None)
        weight = edge[2]['weight']

    edge_trace['text'] = edge_labels  # Set the edge labels

    # Create the node traces
    node_trace = go.Scatter(
        x=[],
        y=[],
        text=[],
        mode='markers+text',
        hoverinfo='text',
        marker=dict(
            showscale=True,
            size=[node_size * 1.5 if node == causal_target else node_size for node in G.nodes()],  # Bigger size for causal target
            colorbar=dict(
                thickness=15,
                title='Variable Strength',
                xanchor='left',
                titleside='right'
            ),
            colorscale='Jet',
            color=["black" if node == causal_target else node_colors[node] for node in G.nodes()],  # Assign node colors
            # opacity=[0.5 if node == causal_target else 1 for node in G.nodes()]  # Set opacity to 0.5 for non-causal target nodes
            opacity=[ 1 for node in G.nodes()]
        ),
        textposition="bottom center" if causal_target != G else "top center",
        textfont_size=10
    )

    for node in G.nodes():
        x, y = pos[node]
        node_trace['x'] += (x,)
        node_trace['y'] += (y,)
        if node == causal_target:
            node_trace['text'] += (causal_target,)
        else:
            weight = strength.get((node, causal_target), 0)
            node_trace['text'] += (f'{node} ({weight:.4f})',)  # Display node labels with the weight value for non-causal target nodes

    # Create the figure with increased bottom margin

    plot_data = [edge_trace, node_trace]
   
    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(
                        width=800,
                        height=700,
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=0, l=0, r=0, t=0),  # Increase the bottom margin
                    ))
    
    plot_data = fig.to_plotly_json()

    # Show the figure
    # fig.show()
    return plot_data